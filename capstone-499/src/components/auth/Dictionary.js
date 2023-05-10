import React, { Component } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import "../../DictionarySite.css";
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
      language: 'en',
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

  handleLanguageChange = (event) => {
    this.setState({ language: event.target.value });
  };

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

    const translations = {
      en: 'English',
      es: 'Español',
      fr: 'Français',
      de: 'Deutsch',
      // Add other languages and translations as needed
    };

    return (


      <div>
        <div ref={this.websiteContainerRef}>
          <div className="dictionary-site">
            <div className="frame-parent">
              <div className="english-parent">
                <div className="english">{translations[this.state.language]}</div>
                {/* <div className="english">English</div> */}
                <div className="darklight-option">
                  <div className="darklight-option-child" />
                  <div className="dark">Dark</div>
                  <img className="darklight-option-item" alt="" src="/group-3.svg" />
                </div>
                <button id="show-text-btn" onClick={this.showTextModal}>
                  <img
                    className="ic-apps-24px-1-icon"
                    alt=""
                    src="/images.png"
                  />
                </button>
                <button id="show-text-btn" onClick={this.props.onProfileClick}>
                <img
                  className="frame-child"
                  alt=""
                  src="/ellipse-2@2x.png"
                />
               </button>
              </div>
              <div className="image-2-parent">
                <img className="image-2-icon" alt="" src="/image-2@2x.png" />
                <div className="translate-me-wrapper">
                  <div className="translate-me">Translate ME!</div>
                </div>
              </div>
            </div>
            <div className="dictionary-site-inner">
              <div className="this-is-our-translate-me-webpa-parent">
                <div className="english">This is our Translate Me Webpage</div>
                <div className="english"> Terms of Use</div>
                <div className="english">Privacy Policy</div>
              </div>
            </div>
            <div className="contents-parent">
              <div className="contents">Contents</div>
              <div className="systematics-and-taxonomy-distr-wrapper">
                <div className="systematics-and-taxonomy-container">
                  <ul className="systematics-and-taxonomy-distr">
                    <li className="systematics-and-taxonomy">
                      <span>Systematics and taxonomy</span>
                    </li>
                    <li className="systematics-and-taxonomy">
                      <span className="as-a-writing">Distribution</span>
                    </li>
                    <li className="systematics-and-taxonomy">
                      <span className="as-a-writing">Ecology</span>
                    </li>
                    <li className="systematics-and-taxonomy">
                      <span className="as-a-writing">Mass flowering</span>
                    </li>
                    <li className="systematics-and-taxonomy">
                      <span className="as-a-writing">Invasive species</span>
                    </li>
                    <li className="systematics-and-taxonomy">
                      <span className="as-a-writing">Animal diet</span>
                    </li>
                    <li className="systematics-and-taxonomy">
                      <span className="as-a-writing">Human health</span>
                    </li>
                    <li className="systematics-and-taxonomy">
                      <span className="as-a-writing">Cultivation</span>
                    </li>
                    <li className="systematics-and-taxonomy">
                      <span className="as-a-writing">Bamboo cultivation</span>
                    </li>
                    <li className="systematics-and-taxonomy">
                      <span className="as-a-writing">Harvesting</span>
                    </li>
                    <li className="systematics-and-taxonomy">
                      <span className="as-a-writing">Central India</span>
                    </li>
                    <li className="systematics-and-taxonomy">
                      <span className="as-a-writing">Uses</span>
                    </li>
                    <li className="systematics-and-taxonomy">
                      <span className="as-a-writing">Culinary</span>
                    </li>
                    <li className="systematics-and-taxonomy">
                      <span className="as-a-writing">Fuel</span>
                    </li>
                    <li className="systematics-and-taxonomy">
                      <span className="as-a-writing">Writing pen</span>
                    </li>
                    <li className="systematics-and-taxonomy">
                      <span className="as-a-writing">Fabri</span>
                    </li>
                    <li className="systematics-and-taxonomy">
                      <span className="as-a-writing">Bambooworking</span>
                    </li>
                    <li className="systematics-and-taxonomy">
                      <span className="as-a-writing">Construction</span>
                    </li>
                    <li className="systematics-and-taxonomy">
                      <span className="as-a-writing">Textiles</span>
                    </li>
                    <li className="systematics-and-taxonomy">
                      <span className="as-a-writing">As a writing surface</span>
                    </li>
                    <li className="systematics-and-taxonomy">
                      <span className="as-a-writing">Weapons</span>
                    </li>
                    <li className="systematics-and-taxonomy">
                      <span className="as-a-writing">Musical instruments</span>
                    </li>
                    <li className="systematics-and-taxonomy">
                      <span className="as-a-writing">Other uses</span>
                    </li>
                    <li className="systematics-and-taxonomy">
                      <span className="as-a-writing">Symbolism and culture</span>
                    </li>
                    <li className="systematics-and-taxonomy">
                      <span className="as-a-writing">See also</span>
                    </li>
                    <li className="systematics-and-taxonomy">
                      <span className="as-a-writing">References</span>
                    </li>
                    <li>
                      <span className="as-a-writing">External links</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="image-4-wrapper">
              <img className="image-4-icon" alt="" src="/image-4@2x.png" />
            </div>
            <div className="frame-group">
              <div className="frame-container">
                <div className="frame-div">
                  <div className="bamboo-parent">
                    <div className="bamboo">Bamboo</div>
                    <div className="twitter-parent">
                      <img
                        className="ic-apps-24px-1-icon"
                        alt=""
                        src="/twitter.svg"
                      />
                      <img
                        className="ic-apps-24px-1-icon"
                        alt=""
                        src="/linkedin.svg"
                      />
                      <img
                        className="ic-apps-24px-1-icon"
                        alt=""
                        src="/facebook.svg"
                      />
                      <img
                        className="ic-insert-link-24px-1-icon"
                        alt=""
                        src="/ic-insert-link-24px-1.svg"
                      />
                    </div>
                  </div>
                  <div className="bamboos-are-a-diverse-group-of-parent">
                    <div className="bamboos-are-a-container">
                      <span>{`Bamboos are a diverse group of evergreen perennial `}</span>
                      <span className="flowering">flowering</span>
                      <span>{` plants in the subfamily Bambusoideae of the grass family Poaceae. Giant bamboos are the largest members of the grass family. The origin of the word "bamboo" is uncertain, but it probably comes from the `}</span>
                      <span className="flowering">Dutch</span>
                      <span>{` or `}</span>
                      <span className="flowering">Portuguese</span>
                      <span>{` language, which originally borrowed it from `}</span>
                      <span className="flowering">Malay</span>
                      <span>{` or `}</span>
                      <span className="flowering">Kannada</span>
                      <span>.</span>
                    </div>
                    <div className="bamboos-are-a-container">
                      <span>{`In bamboo, as in other grasses, the internodal regions of the stem are usually hollow and the vascular bundles in the cross-section are scattered throughout the stem instead of in a cylindrical arrangement. `}</span>
                      <span className="flowering">The dicotyledonous</span>
                      <span>{` woody xylem is also absent. The absence of secondary growth wood causes the stems of `}</span>
                      <span className="flowering">monocots</span>
                      <span>{`, including the palms and large bamboos, to be `}</span>
                      <span className="flowering">columnar</span>
                      <span> rather than tapering.</span>
                    </div>
                    <div className="bamboos-include-some-of-the-fa-parent">
                      <div className="bamboos-are-a-container">
                        <span>{`Bamboos include some of the fastest-growing `}</span>
                        <span className="flowering">plants</span>
                        <span>{` in the world,due to a unique rhizome-dependent system. `}</span>
                        <span className="flowering">Certain species</span>
                        <span> of</span>
                      </div>
                      <div className="bamboo-can-grow-container">
                        <span>{`bamboo can grow 910 mm (36 in) within a 24-hour period, at a rate Bamboos include some of the `}</span>
                        <span className="flowering">fastest-growing</span>
                        <span>{` plants in the world, due to a unique rhizome-dependent system. Certain species of bamboo can grow 910 mm (36 in) within a 24-hour period, at a rate of almost 40 mm (1+1⁄2 in) an `}</span>
                        <span className="flowering">hour</span>
                        <span>{` (equivalent to 1 mm every 90 seconds).[6] This `}</span>
                        <span className="flowering">rapid</span>
                        <span>{` growth and `}</span>
                        <span className="flowering">tolerance</span>
                        <span>{` for `}</span>
                        <span className="flowering">marginal land</span>
                        <span>{`, make bamboo a good `}</span>
                        <span className="flowering">candidate</span>
                        <span>{` for `}</span>
                        <span className="flowering">afforestation</span>
                        <span>{`, `}</span>
                        <span className="flowering">carbon</span>
                        <span>{` sequestration and `}</span>
                        <span className="flowering">climate</span>
                        <span> change mitigation</span>
                      </div>
                    </div>
                    <div className="bamboos-are-of-notable-economi-wrapper">
                      <div className="bamboos-are-of">
                        Bamboos are of notable economic and cultural significance in
                        South Asia, Southeast Asia, and East Asia, being used for
                        building materials, as a food source, and as a versatile raw
                        product. Bamboo, like wood, is a natural composite material
                        with a high strength-to-weight ratio useful for structures.[7]
                        Bamboo's strength-to-weight ratio is similar to timber, and
                        its strength is generally similar to a strong softwood or
                        hardwood timber.
                      </div>
                    </div>
                  </div>
                </div>
                <div className="systematics-and-taxonomy-parent">
                  <div className="systematics-and-taxonomy1">
                    Systematics and taxonomy
                  </div>
                  <div className="bamboos-have-long-been-conside-wrapper">
                    <div className="bamboos-are-of">
                      Bamboos have long been considered the most primitive grasses,
                      mostly because of the presence of bracteate, indeterminate
                      inflorescences, "pseudospikelets", and flowers with three
                      lodicules, six stamens, and three stigmata.[11] Following more
                      recent molecular phylogenetic research, many tribes and genera
                      of grasses formerly included in the Bambusoideae are now
                      classified in other subfamilies, e.g. the Anomochlooideae, the
                      Puelioideae, and the Ehrhartoideae. The subfamily in its current
                      sense belongs to the BOP clade of grasses, where it is sister to
                      the Pooideae (bluegrasses and relatives).[10]
                    </div>
                  </div>
                </div>
              </div>
              <div className="frame-parent1">
                <div className="frame-wrapper">
                  <div className="frame-div">
                    <div className="systematics-and-taxonomy1">Distribution</div>
                    <div className="bamboos-are-a-diverse-group-of-parent">
                      <div className="bamboos-are-of">
                        Most bamboo species are native to warm and moist tropical and
                        to warm temperate climates.[12] However, many species are
                        found in diverse climates, ranging from hot tropical regions
                        to cool mountainous regions and highland cloud forests.
                      </div>
                      <div className="bamboos-are-of">
                        In the Asia-Pacific region they occur across East Asia, from
                        north to 50 °N latitude in Sakhalin,[13] to south to northern
                        Australia, and west to India and the Himalayas. China, Japan,
                        Korea, India and Australia, all have several endemic
                        populations.[14] They also occur in small numbers in
                        sub-Saharan Africa, confined to tropical areas, from southern
                        Senegal in the north to southern Mozambique and Madagascar in
                        the south.[15] In the Americas, bamboo has a native range from
                        47 °S in southern Argentina and the beech forests of central
                        Chile, through the South American tropical rainforests, to the
                        Andes in Ecuador near 4,300 m (14,000 ft). Bamboo is also
                        native through Central America and Mexico, northward into the
                        Southeastern United States.[16] Canada and continental Europe
                        are not known to have any native species of bamboo.[17] As
                        garden plants, many species grow readily outside these ranges,
                        including most of Europe and the United States.
                      </div>
                    </div>
                  </div>
                </div>
                <div className="frame-parent2">
                  <div className="frame-div">
                    <div className="image-4-container">
                      <img className="image-4-icon" alt="" src="/image-41@2x.png" />
                    </div>
                    <div className="english">
                      <span>{`Phyllostachys pubescens `}</span>
                      <span className="in">in</span>
                      <span> Batumi Botanical Garden</span>
                    </div>
                  </div>
                  <div className="frame-parent4">
                    <div className="frame-wrapper1">
                      <div className="image-4-container">
                        <img className="image-4-icon" alt="" src="/image-42@2x.png" />
                      </div>
                    </div>
                    <div className="english">
                      <span>{`Bamboo forest in `}</span>
                      <span className="flowering">Arashiyama</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="frame-wrapper">
                <div className="frame-wrapper">
                  <div className="frame-div">
                    <div className="systematics-and-taxonomy1">Ecology</div>
                    <div className="bamboos-are-a-diverse-group-of-parent">
                      <div className="bamboos-are-of">
                        The two general patterns for the growth of bamboo are
                        "clumping", and "running", with short and long underground
                        rhizomes, respectively. Clumping bamboo species tend to spread
                        slowly, as the growth pattern of the rhizomes is to simply
                        expand the root mass gradually, similar to ornamental grasses.
                        "Running" bamboos, though, need to be controlled during
                        cultivation because of their potential for aggressive
                        behavior. They spread mainly through their rhizomes, which can
                        spread widely underground and send up new culms to break
                        through the surface. Running bamboo species are highly
                        variable in their tendency to spread; this is related to both
                        the species and the soil and climate conditions. Some can send
                        out runners of several meters a year, while others can stay in
                        the same general area for long periods. If neglected, over
                        time, they can cause problems by moving into adjacent areas.
                      </div>
                      <div className="bamboos-are-of">
                        Bamboos include some of the fastest-growing plants on Earth,
                        with reported growth rates up to 910 mm (36 in) in 24
                        hours.[6] However, the growth rate is dependent on local soil
                        and climatic conditions, as well as species, and a more
                        typical growth rate for many commonly cultivated bamboos in
                        temperate climates is in the range of 30–100 mm (1–4 in) per
                        day during the growing period. Primarily growing in regions of
                        warmer climates during the late Cretaceous period, vast fields
                        existed in what is now Asia. Some of the largest timber bamboo
                        can grow over 30 m (100 ft) tall, and be as large as 250–300
                        mm (10–12 in) in diameter. However, the size range for mature
                        bamboo is species-dependent, with the smallest bamboos
                        reaching only several inches high at maturity. A typical
                        height range that would cover many of the common bamboos grown
                        in the United States is 4.5–12 m (15–39 ft), depending on
                        species. Anji County of China, known as the "Town of Bamboo",
                        provides the optimal climate and soil conditions to grow,
                        harvest, and process some of the most valued bamboo poles
                        available worldwide.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <img className="frame-item" alt="" src="/vector-3.svg" />
              <div className="systematics-and-taxonomy1">References</div>
              <div className="kelchner-s-bamboo-phylogeny-w-parent">
                <div className="kelchner-s-bamboo-container">
                  <p className="kelchner-s-bamboo">
                    Kelchner S; Bamboo Phylogeny Working Group (2013). "Higher level
                    phylogenetic relationships within the bamboos (Poaceae:
                    Bambusoideae) based on five plastid markers" (PDF). Molecular
                    Phylogenetics and Evolution. 67 (2): 404–413.
                    doi:10.1016/j.ympev.2013.02.005. ISSN 1055-7903. PMID 23454093.
                    Archived from the original (PDF) on 5 June 2015.
                  </p>
                  <p className="kelchner-s-bamboo">
                    Soreng, Robert J.; Peterson, Paul M.; Romaschenko, Konstantin;
                    Davidse, Gerrit; Zuloaga, Fernando O.; Judziewicz, Emmet J.;
                    Filgueiras, Tarciso S.; Davis, Jerrold I.; Morrone, Osvaldo
                    (2015). "A worldwide phylogenetic classification of the Poaceae
                    (Gramineae)". Journal of Systematics and Evolution. 53 (2):
                    117–137. doi:10.1111/jse.12150. ISSN 1674-4918. S2CID 84052108.
                    open access
                  </p>
                  <p className="bamboo-oxford-english">
                    "bamboo". Oxford English Dictionary (Online ed.). Oxford
                    University Press. (Subscription or participating institution
                    membership required.)
                  </p>
                </div>
                <div className="div">1.</div>
                <div className="div1">2.</div>
                <div className="div2">3.</div>
                <div className="wilson-cl-loomis-we-bo-parent">
                  <div className="wilson-cl-container">
                    <p className="kelchner-s-bamboo">{`Wilson, C.L. & Loomis, W.E. Botany (3rd ed.). Holt, Rinehart and Winston.`}</p>
                    <p className="kelchner-s-bamboo">
                      Farrelly, David (1984). The Book of Bamboo. Sierra Club Books.
                      ISBN 978-0-87156-825-0.
                    </p>
                    <p className="kelchner-s-bamboo">
                      Fastest growing plant". Guinness World Records. Archived from
                      the original on 3 September 2014. Retrieved 22 August 2014.
                    </p>
                    <p className="kelchner-s-bamboo">
                      Lakkad; Patel (June 1981). "Mechanical properties of bamboo, a
                      natural composite". Fibre Science and Technology. 14 (4):
                      319–322. doi:10.1016/0015-0568(81)90023-3.
                    </p>
                    <p className="kelchner-s-bamboo">
                      Kaminski, S.; Lawrence, A.; Trujillo, D. (2016). "Structural use
                      of bamboo. Part 1: Introduction to bamboo". The Structural
                      Engineer. 94 (8): 40–43.
                    </p>
                    <p className="bamboo-oxford-english">
                      Kaminski, S.; Lawrence, A.; Trujillo, D.; Feltham, I.; Felipe
                      López, L. (2016). "Structural use of bamboo. Part 3: Design
                      values". The Structural Engineer. 94 (12): 42–45.
                    </p>
                  </div>
                  <div className="div">4.</div>
                  <div className="div4">6.</div>
                  <div className="div5">7.</div>
                  <div className="div6">8.</div>
                  <div className="div7">9.</div>
                  <div className="div8">9.</div>
                </div>
              </div>
              <img className="frame-item" alt="" src="/vector-3.svg" />
              <img className="frame-item" alt="" src="/vector-3.svg" />
              <img className="frame-item" alt="" src="/vector-3.svg" />
            </div>
          </div>

        </div>
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
                    <select
                      id="language-select"
                      /* value={this.state.language} */
                      onChange={this.handleLanguageChange}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
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

// Add this after the Dictionary class definition
function DictionaryWithNavigation(props) {
  const navigate = useNavigate();

  const handleProfileNavigation = () => {
    navigate('/profile');
  };

  return <Dictionary {...props} onProfileClick={handleProfileNavigation} />;
}
export default DictionaryWithNavigation;
//export default Dictionary;