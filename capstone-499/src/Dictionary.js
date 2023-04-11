import React, { Component } from 'react';
import './App.css';
import axios from 'axios';

class Dictionary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      textModalVisible: false,
      editPanelVisible: false,
      languageModalVisible: false,
      textContent: '',
      searchValue: '',
      editValue: '',
      editDefinition: '',
      wordList: [],
      filteredList: [],
      selectedLanguage: 'es',
      translatedText: '',
    };
  }

  componentDidMount() {
    this.loadTextFile();
  }

  showTextModal = () => {
    this.setState({ textModalVisible: true });
  };

  hideTextModal = () => {
    this.setState({ textModalVisible: false });
  };

  showEditPanel = () => {
    this.setState({ editPanelVisible: true });
  };

  hideEditPanel = () => {
    this.setState({ editPanelVisible: false });
  };

  showLanguageModal = () => {
    this.setState({ languageModalVisible: true });
  };

  hideLanguageModal = () => {
    this.setState({ languageModalVisible: false });
  };

  loadTextFile = async () => {
    try {
      const response = await fetch('/English.txt');
      const text = await response.text();
      const wordList = text.split('\n').map(line => {
        const [text, definition] = line.split('-');
        return { text, definition };
      });
      this.setState({ wordList, textContent: text }, () => {
        this.handleSearch();
      });
    } catch (error) {
      console.error('Error loading text file:', error);
    }
  };



  handleSearchChange = (e) => {
    this.setState({ searchValue: e.target.value }, () => {
      this.handleSearch();
    });
  }

  handleSearch() {
    const { searchValue, wordList } = this.state;
    const filteredList = wordList.filter((word) =>
      word.text.toLowerCase().includes(searchValue.toLowerCase())
    );
    this.setState({ filteredList });
  }

  handleAddWord() {
    const { wordList, searchValue } = this.state;
    const newWord = {
      text: searchValue,
      definition: 'New word definition',
    };
    this.setState(
      {
        wordList: [...wordList, newWord],
        searchValue: '',
      },
      () => {
        this.handleSearch();
      }
    );
  }

  handleDeleteWord(index) {
    const { wordList } = this.state;
    const updatedWordList = wordList.filter((_, idx) => idx !== index);
    this.setState({ wordList: updatedWordList }, () => {
      this.handleSearch();
    });
  }

  handleEditChange(e, type) {
    this.setState({ [type]: e.target.value });
  }

  handleEditWord(index) {
    const { wordList, editValue, editDefinition } = this.state;
    const updatedWordList = wordList.map((word, idx) => {
      if (idx === index) {
        return { text: editValue, definition: editDefinition };
      }
      return word;
    });
    this.setState({ wordList: updatedWordList }, () => {
      this.handleSearch();
    });
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
        this.setState({ translatedText });
      } else {
        alert('Error occurred while translating the text');
      }
    } catch (error) {
      console.error('Translation API error:', error);
      alert('Error occurred while translating the text');
    }
  }

  handleLanguageChange(e) {
    this.setState({ selectedLanguage: e.target.value });
  }

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
              <div id="search-bar">
                <input
                  type="text"
                  id="search-field"
                  placeholder="Search..."
                  onChange={this.handleSearchChange}
                />
                {/* <button id="search-btn">Search</button> */}
                <button id="add-word-btn" onClick={this.handleAddWord}>+</button>
                {/* <button id="delete-word-btn">-</button> */}
              </div>
              {/* <div id="text-container">
                <pre>{this.state.textContent.split('\n').map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}</pre>

              </div> */}
              <div id="text-container">
                {filteredList.map((word, index) => (
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
                ))}
              </div>

              <button id="edit-btn" onClick={this.showEditPanel}>
                Edit
              </button>
              <button id="change-lang-btn" onClick={this.showLanguageModal}>
                Change Language
              </button>

              {editPanelVisible && (
                <div id="edit-panel">
                  <div id="edit-container">
                    <input
                      type="text"
                      id="edit-word"
                      placeholder="Word..."
                      value={editValue}
                      onChange={(e) => this.handleEditChange(e, 'editValue')}
                    />
                    <textarea
                      id="edit-definition"
                      placeholder="Definition..."
                      rows="5"
                      value={editDefinition}
                      onChange={(e) =>
                        this.handleEditChange(e, 'editDefinition')
                      }
                    ></textarea>
                  </div>
                  <button id="save-btn" onClick={this.handleEditWord}>
                    Save
                  </button>
                  <button id="cancel-btn" onClick={this.hideEditPanel}>
                    Cancel
                  </button>
                </div>
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
                    <button id="translate-btn" onClick={this.handleTranslate}>Translate</button>
                    <button id="cancel-translate-btn" onClick={this.hideLanguageModal}>Cancel</button>
                    <button id="translate-back-btn">Translate Back to English</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}
export default Dictionary;
