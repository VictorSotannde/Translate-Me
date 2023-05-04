import React, { Component } from 'react';
import '/Users/ekow_t/Desktop/Capstone-499/capstone-499/src/App.css';
import axios from 'axios';
import Modal from '../../Modal';

class Dictionary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      textModalVisible: false,
      editPanelVisible: false,
      languageModalVisible: false,
      addWordModalVisible: false,
      isTextTranslated: false,
      newWordValue: '',
      newDefinitionValue: '',
      textContent: '',
      searchValue: '',
      editValue: '',
      editDefinition: '',
      wordList: [],
      filteredList: [],
      translatedWordList: [],
      selectedLanguage: 'es',
      translatedText: '',
    };
    this.handleEditChange = this.handleEditChange.bind(this);
    this.handleLanguageChange = this.handleLanguageChange.bind(this);
  }

  componentDidMount() {
    fetch('http://localhost:4000/api/data')
      .then((response) => response.json())
      .then((data) => {
        const rawWordList = data.text.split('\n');
        const formattedWordList = rawWordList.map((entry) => {
          const [text, definition] = entry.split(' - ');
          return { text, definition };
        });
        const sortedWordList = formattedWordList.sort((a, b) => a.text.localeCompare(b.text));
        this.setState({ wordList: sortedWordList }, () => {
          console.log(this.state.wordList);
        });
      });
  }

  showTextModal = () => {
    this.setState({ textModalVisible: true });
  };

  hideTextModal = () => {
    this.setState({ textModalVisible: false });
  };

  showEditPanel = (word) => {
    const editIndex = this.state.wordList.findIndex((item) => item.text === word.text);
    this.setState({
      editPanelVisible: true,
      editIndex: editIndex,
      editValue: word.text,
      editDefinition: word.definition,
    });
  };

  hideEditPanel = () => {
    this.setState({ editPanelVisible: false, editValue: '', editDefinition: '' });
  };

  showLanguageModal = () => {
    this.setState({ languageModalVisible: true });
  };

  hideLanguageModal = () => {
    this.setState({ languageModalVisible: false });
  };

  handleSearchChange = (e) => {
    this.setState({ searchValue: e.target.value }, () => {
      this.handleSearch();
    });
  }

  handleAddWordModal = () => {
    this.setState((prevState) => ({
      addWordModalVisible: !prevState.addWordModalVisible,
    }));
  };

  handleSearch() {
    const { searchValue, wordList } = this.state;
    const filteredList = wordList.filter((word) =>
      word.text.toLowerCase().includes(searchValue.toLowerCase())
    );
    this.setState({ filteredList });
  }

  handleAddWord = () => {
    const newEntry = {
      text: this.state.newWordValue,
      definition: this.state.newDefinitionValue,
    };

    this.setState((prevState) => {
      const newList = [...prevState.wordList];
      const insertIndex = newList.findIndex((word) => word.text.localeCompare(newEntry.text) > 0);
      if (insertIndex === -1) {
        newList.push(newEntry);
      } else {
        newList.splice(insertIndex, 0, newEntry);
      }

      return {
        wordList: newList,
        addWordModalVisible: false,
        newWordValue: '',
        newDefinitionValue: '',
      };
    });
  };


  handleDeleteWord = (index) => {
    // Check if the searchValue is present
    if (this.state.searchValue) {
      // If so, remove the word from the filtered list and find the corresponding index in the original word list
      const wordToDelete = this.state.filteredList[index];
      const originalIndex = this.state.wordList.findIndex((word) => word.text === wordToDelete.text);
      this.setState((prevState) => {
        const newList = [...prevState.wordList];
        newList.splice(originalIndex, 1);
        return { wordList: newList };
      });
    } else {
      // If not, remove the word from the original word list
      this.setState((prevState) => {
        const newList = [...prevState.wordList];
        newList.splice(index, 1);
        return { wordList: newList };
      });
    }
  };

  handleEditChange(event, type) {
    this.setState({ [type]: event.target.value });
  }

  handleEditWord = () => {
    const { editIndex, editValue, editDefinition } = this.state;

    this.setState((prevState) => {
      const newList = [...prevState.wordList];
      newList[editIndex] = {
        text: editValue,
        definition: editDefinition,
      };
      return { wordList: newList, editPanelVisible: false, editValue: '', editDefinition: '' };
    });
  };

  async translateWordList(wordList, targetLanguage) {
    const apiKey = 'AIzaSyBioEiNvHvyhP2Ay98x_xAAs5pQGYs23P4';

    const translateRequest = async (text) => {
      try {
        const response = await axios.post(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
          q: text,
          target: targetLanguage,
          format: 'text',
        });

        if (response.data && response.data.data && response.data.data.translations) {
          return response.data.data.translations[0].translatedText;
        }
      } catch (error) {
        console.error('Translation API error:', error);
      }
    };

    const translatedWordList = [];

    for (const word of wordList) {
      const translatedText = await translateRequest(word.text);
      const translatedDefinition = await translateRequest(word.definition);
      translatedWordList.push({ text: translatedText, definition: translatedDefinition });
    }

    return translatedWordList;
  }

  async handleTranslate() {
    const apiKey = 'AIzaSyBioEiNvHvyhP2Ay98x_xAAs5pQGYs23P4'; // Replace with your actual API key
    const text = this.state.textContent; // Replace with the text you want to translate
    const targetLanguage = this.state.selectedLanguage; // Make sure you have the selected language in the state

    try {
      const response = await axios.post(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
        q: text,
        target: targetLanguage,
        format: 'text',
      });

      if (response.data && response.data.data && response.data.data.translations) {
        const translatedText = response.data.data.translations[0].translatedText;
        this.setState({ translatedText, isTextTranslated: true });
      } else {
        alert('Error occurred while translating the text');
      }
    } catch (error) {
      console.error('Translation API error:', error);
      alert('Error occurred while translating the text');
    }
    const translatedWordList = await this.translateWordList(this.state.wordList, targetLanguage);
    this.setState({ translatedWordList, isTextTranslated: true });
  }

  handleTranslateBackToEnglish = async () => {
    const apiKey = 'AIzaSyBioEiNvHvyhP2Ay98x_xAAs5pQGYs23P4';
    const text = this.state.translatedText;
    const targetLanguage = 'en';

    try {
      const response = await axios.post(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
        q: text,
        target: targetLanguage,
        format: 'text',
      });

      if (response.data && response.data.data && response.data.data.translations) {
        const translatedText = response.data.data.translations[0].translatedText;
        this.setState({ translatedText, isTextTranslated: false });
      } else {
        alert('Error occurred while translating the text back to English');
      }
    } catch (error) {
      console.error('Translation API error:', error);
      alert('Error occurred while translating the text back to English');
    }
    this.setState({ translatedWordList: [], isTextTranslated: false });
  };

  handleLanguageChange(e) {
    this.setState({ selectedLanguage: e.target.value });
  }

  handleTextContentChange = (e) => {
    this.setState({ textContent: e.target.value });
  };

  render() {
    const {
      textModalVisible,
      editPanelVisible,
      languageModalVisible,
      filteredList,
      editValue,
      editDefinition,
      selectedLanguage,
    } = this.state;

    const displayList = this.state.isTextTranslated ? this.state.translatedWordList : (this.state.searchValue ? filteredList : this.state.wordList);

    return (


      <div>
        <h1>My Webpage</h1>
        <p>Click the button below to show the text content.</p>
      


        <button id="show-text-btn" onClick={this.showTextModal}>
          Show Text
        </button>

        {textModalVisible && (
          <div id="text-modal">
            <div className="modal-content">
              <span className="close" onClick={this.hideTextModal}>
                &times;
              </span>
              {/* <input
                type="text"
                id="text-content-field"
                placeholder="Enter text to translate..."
                value={this.state.textContent}
                onChange={this.handleTextContentChange}
              /> */}
              <div id="search-bar">
                <input
                  type="text"
                  id="search-field"
                  placeholder="Search..."
                  onChange={this.handleSearchChange}
                />
                <button id="add-word-btn" onClick={this.handleAddWordModal}>+</button>
              </div>
              <div id="text-container">
                {/* {(this.state.searchValue ? this.state.filteredList : this.state.wordList).map((word, index) => (
                  <div key={index} className="word-entry">
                    <h3>Word: {word.text}</h3>
                    <p>Definition: {word.definition}</p>
                    <button onClick={() => this.handleDeleteWord(index)}>
                      Delete
                    </button>
                    <button onClick={() => this.showEditPanel(index)}>
                      Edit
                    </button>
                  </div>
                ))} */}
                {(displayList).map((word, index) => (
                  <div key={index} className="word-entry">
                    <h3>Word: {word.text}</h3>
                    <p>Definition: {word.definition}</p>
                    <button onClick={() => this.handleDeleteWord(index)}>
                      Delete
                    </button>
                    <button onClick={() => this.showEditPanel(word)}>
                      Edit
                    </button>
                  </div>
                ))}
                {/*                 {this.state.isTextTranslated && (
                  <div>
                    <h3>Translated Text:</h3>
                    <p>{this.state.translatedText}</p>
                  </div>
                )} */}
              </div>
              {this.state.addWordModalVisible && (
                <Modal onClose={this.handleAddWordModal}>
                  <h3>Add Word</h3>
                  <input
                    type="text"
                    placeholder="Word"
                    value={this.state.newWordValue}
                    onChange={(e) => this.setState({ newWordValue: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Definition"
                    value={this.state.newDefinitionValue}
                    onChange={(e) => this.setState({ newDefinitionValue: e.target.value })}
                  />
                  <button onClick={this.handleAddWord}>Save</button>
                  <button onClick={this.handleAddWordModal}>Cancel</button>
                </Modal>
              )}
              {/* <button id="edit-btn" onClick={this.showEditPanel}>
                Edit
              </button> */}
              <button id="change-lang-btn" onClick={this.showLanguageModal}>
                Change Language
              </button>

              {editPanelVisible && (
                <Modal onClose={this.hideEditPanel}>
                  <h3>Edit Word</h3>
                  <input
                    type="text"
                    placeholder="Word"
                    value={editValue}
                    onChange={(e) => this.handleEditChange(e, 'editValue')}
                  />
                  <input
                    type="text"
                    placeholder="Definition"
                    value={editDefinition}
                    onChange={(e) => this.handleEditChange(e, 'editDefinition')}
                  />
                  <button onClick={this.handleEditWord}>Save</button>
                  <button onClick={this.hideEditPanel}>Cancel</button>
                </Modal>
              )}
              {languageModalVisible && (
                <div id="language-modal">
                  <div className="modal-content">
                    <span className="close-lang" onClick={this.hideLanguageModal}>&times;</span>
                    <h2>Select Language</h2>
                    <select id="language-select" onChange={this.handleLanguageChange}>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      {/* Add more languages here */}
                    </select>
                    <button id="translate-btn" onClick={() => this.handleTranslate()}>Translate</button>
                    <button id="cancel-translate-btn" onClick={this.hideLanguageModal}>Cancel</button>
                    <button id="translate-back-btn" onClick={this.handleTranslateBackToEnglish}>Translate Back to English</button>
                  </div>
                </div>
              )}
              {
                this.state.isTextTranslated && (
                  <div>
                    <h3>Translated Text:</h3>
                    <p>{this.state.translatedText}</p>
                  </div>
                )
              }
            </div>
          </div>
        )}
      </div>
    );
  }
}
export default Dictionary;
