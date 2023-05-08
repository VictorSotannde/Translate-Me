import React, { Component } from 'react';
import '../../App.css';
import axios from 'axios';
import Modal from '../../Modal';

class Dictionary extends Component {
  debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        fn(...args);
      }, delay);
    };
  }

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
      translatedWebsiteContent: null,
    };
    this.handleEditChange = this.handleEditChange.bind(this);
    this.handleLanguageChange = this.handleLanguageChange.bind(this);
    this.handleSearchChange = this.debounce(this.handleSearchChange.bind(this), 300);
    this.websiteContainerRef = React.createRef();
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
    this.refreshWordList();
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

  refreshWordList = async () => {
    const response = await fetch('/api/data');
    const data = await response.json();
    const wordList = data.text.split('\n').filter((line) => line.trim() !== '');
    this.setState({ wordList });
  };


  handleAddWord = async () => {
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

    // Send a POST request to the backend to add the word
    await fetch('http://localhost:4000/api/data/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: newEntry.text, definition: newEntry.definition }),
    });

    this.refreshWordList();
  };

  /* handleDeleteWord = async (index) => {
    const wordList = this.state.searchValue ? this.state.filteredList : this.state.wordList;
    const wordToDelete = wordList[index];
  
    this.setState((prevState) => {
      const newList = [...prevState.wordList];
      const originalIndex = newList.findIndex((word) => word.text === wordToDelete.text);
      newList.splice(originalIndex, 1);
      return { wordList: newList };
    });
  
    // Send a DELETE request to the backend to delete the word
    await fetch('/api/data/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: wordToDelete.text }),
    });
  
    this.refreshWordList();
  }; */

  handleDeleteWord = async (index) => {
    const wordList = this.state.searchValue ? this.state.filteredList : this.state.wordList;
    const wordToDelete = wordList[index];
  
    // Send a DELETE request to the backend to delete the word
    await fetch('http://localhost:4000/api/data/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: wordToDelete.text }),
    });
  
    // Refresh the word list after the deletion
    this.refreshWordList();
  };
  

  handleEditChange(event, type) {
    this.setState({ [type]: event.target.value });
  }

  handleEditWord = async () => {
    const { editIndex, editValue, editDefinition } = this.state;

    this.setState((prevState) => {
      const newList = [...prevState.wordList];
      newList[editIndex] = {
        text: editValue,
        definition: editDefinition,
      };
      return { wordList: newList, editPanelVisible: false, editValue: '', editDefinition: '' };
    });
    // Send a PUT request to the backend to update the word
    const wordToUpdate = this.state.wordList[editIndex];
    const updatedEntry = { text: editValue, definition: editDefinition };
    await fetch('http://localhost:4000/api/data/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ originalWord: wordToUpdate.text, updatedWord: updatedEntry.text, updatedDefinition: updatedEntry.definition }),
    });

    this.refreshWordList();
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

    const translationPromises = wordList.map(async (word) => {
      const translatedTextPromise = translateRequest(word.text);
      const translatedDefinitionPromise = translateRequest(word.definition);
      const [translatedText, translatedDefinition] = await Promise.all([translatedTextPromise, translatedDefinitionPromise]);
      return { text: translatedText, definition: translatedDefinition };
    });

    return Promise.all(translationPromises);
  }

  async translateElement(element, targetLanguage) {
    if (element.nodeType === Node.TEXT_NODE && element.textContent.trim()) {
      const translatedText = await this.translateText(element.textContent, targetLanguage);
      element.textContent = translatedText;
    } else if (element.childNodes.length > 0) {
      for (const child of element.childNodes) {
        await this.translateElement(child, targetLanguage);
      }
    }
  }

  async translateText(text, targetLanguage) {
    const apiKey = 'AIzaSyBioEiNvHvyhP2Ay98x_xAAs5pQGYs23P4';
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
    this.hideLanguageModal();
    this.setState({ translatedWordList, isTextTranslated: true });
    const { selectedLanguage } = this.state;
    await this.translateElement(this.websiteContainerRef.current, this.state.selectedLanguage);
  }

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
        <div ref={this.websiteContainerRef}>
          <div className="top-bar">
            <div className="left">
              <h1>My Webpage</h1>
            </div>
            <div className="right">
              <button id="showTextButton" onClick={this.showTextModal}>
                Dictionary
              </button>
            </div>
          </div>
          <h2>Interesting Facts About Software</h2>

          <h3>Fact 1: The first computer program</h3>
          <p>
            Ada Lovelace, an English mathematician, is credited with writing the first computer program in the 19th century. She worked on Charles Babbage's Analytical Engine and wrote an algorithm to compute Bernoulli numbers.
          </p>

          <h3>Fact 2: The history of open-source software</h3>
          <p>
            The concept of open-source software dates back to the 1950s and 1960s when computer programs were shared freely among users. The modern open-source movement began in the 1980s with the creation of the GNU Project by Richard Stallman.
          </p>

          <h3>Fact 3: The largest software company</h3>
          <p>
            Microsoft, founded by Bill Gates and Paul Allen in 1975, is currently the largest software company in the world. Some of its most popular products include Windows, Office, and Azure.
          </p>

          <h3>Fact 4: The importance of software testing</h3>
          <p>
            Software testing is a crucial aspect of software development. It helps ensure that the software meets the requirements and functions correctly. According to a study by the National Institute of Standards and Technology, software bugs cost the U.S. economy approximately $59.5 billion annually.
          </p>

          <h3>Fact 5: The rise of artificial intelligence (AI) in software development</h3>
          <p>
            Artificial intelligence is transforming the software development process. AI-powered tools are increasingly being used to automate tasks, improve code quality, and enhance user experiences. Examples of AI in software development include natural language processing, machine learning, and deep learning techniques.
          </p>

        </div>
        {/* <button id="show-text-btn" onClick={this.showTextModal}>
          Show Text
        </button> */}

        {textModalVisible && (
          <div id="text-modal">
            <div className="modal-content">
              <span className="close" onClick={this.hideTextModal}>
                &times;
              </span>
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
              </div>
              {this.state.addWordModalVisible && (
                <Modal onClose={this.handleAddWordModal}>
                  <h3>Add Word</h3>
                  <input
                    type="text"
                    value={this.state.newWordValue}
                    onChange={(e) => this.setState({ newWordValue: e.target.value })}
                    placeholder="New word"
                  />
                  <input
                    type="text"
                    value={this.state.newDefinitionValue}
                    onChange={(e) => this.setState({ newDefinitionValue: e.target.value })}
                    placeholder="New definition"
                  />
                  <button onClick={this.handleAddWord}>Save</button>
                  <button onClick={this.handleAddWordModal}>Cancel</button>
                </Modal>
              )}
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
                      <option value="en">English</option>
                      {/* Add more languages here */}
                    </select>
                    <button id="translate-btn" onClick={() => this.handleTranslate()}>Translate</button>
                    <button id="cancel-translate-btn" onClick={this.hideLanguageModal}>Cancel</button>
                    {/* <button id="translate-back-btn" onClick={this.handleTranslateBackToEnglish}>Translate Back to English</button> */}
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
