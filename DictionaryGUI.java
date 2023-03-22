import javax.swing.*;
import javax.swing.text.BadLocationException;
import javax.swing.text.DefaultHighlighter;
import javax.swing.text.Highlighter;

import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Map;
import java.util.TreeMap;



public class DictionaryGUI extends JFrame {
    private JTextField searchField;
    private JTextPane definitionArea;
    private JScrollPane definitionScrollPane;
    private JButton searchButton;
    private JButton changeLanguageButton;
    private JButton editButton;
    private JButton saveButton;
    private JButton cancelButton;
    private JTextField editWordField;
    private JTextArea editDefinitionField;
    private JButton addWordButton;
    private JButton deleteWordButton;
    private boolean deleteMode;

    private Map<String, String> dictionary;
    private String selectedWord;
    private String currentLanguage;

    public DictionaryGUI() {
        setTitle("Dictionary");
        setSize(600, 400);
        setLayout(new BorderLayout());

        // Create UI components
        searchField = new JTextField();
        definitionArea = new JTextPane();
        definitionScrollPane = new JScrollPane(definitionArea);
        searchButton = new JButton("Search");
        changeLanguageButton = new JButton("Change Language");
        editButton = new JButton("Edit");
        saveButton = new JButton("Save");
        cancelButton = new JButton("Cancel");
        editWordField = new JTextField();
        editDefinitionField = new JTextArea();
        editDefinitionField.setLineWrap(true);
        editDefinitionField.setWrapStyleWord(true);
        JScrollPane editDefinitionScrollPane = new JScrollPane(editDefinitionField);
        editDefinitionScrollPane.setPreferredSize(new Dimension(320, 60));
        addWordButton = new JButton("+");
        deleteWordButton = new JButton("-");

        // Apply the style
        GUIStyle.applyStyle(this);
        GUIStyle.applyStyle(searchField);
        GUIStyle.applyStyle(definitionArea);
        GUIStyle.applyStyle(searchButton, GUIStyle.ButtonType.DEFAULT);
        GUIStyle.applyStyle(changeLanguageButton, GUIStyle.ButtonType.CHANGE_LANGUAGE);
        GUIStyle.applyStyle(editButton, GUIStyle.ButtonType.EDIT);
        GUIStyle.applyStyle(saveButton, GUIStyle.ButtonType.SAVE);
        GUIStyle.applyStyle(cancelButton, GUIStyle.ButtonType.CANCEL);
        GUIStyle.applyStyle(addWordButton, GUIStyle.ButtonType.DEFAULT);
        GUIStyle.applyStyle(deleteWordButton, GUIStyle.ButtonType.DEFAULT);

        // Customize UI components
        searchButton.setPreferredSize(new Dimension(100, 20)); // Change the width from 80 to 100
        searchField.setPreferredSize(new Dimension(300, 20)); // Change the width from 320 to 300
        editWordField.setPreferredSize(new Dimension(320, 20));
        editDefinitionField.setPreferredSize(new Dimension(320, 20));
        addWordButton.setPreferredSize(new Dimension(20, 20));
        deleteWordButton.setPreferredSize(new Dimension(20, 20));
        addWordButton.setPreferredSize(new Dimension(60, 20));
        deleteWordButton.setPreferredSize(new Dimension(60, 20));

        // Add UI components
        JPanel searchPanel = new JPanel(new BorderLayout());
        searchPanel.add(searchField, BorderLayout.CENTER);
        add(searchPanel, BorderLayout.NORTH);
        add(definitionScrollPane, BorderLayout.CENTER);

        JPanel editPanel = new JPanel(new BorderLayout());
        editPanel.add(editWordField, BorderLayout.NORTH);
        editPanel.add(editDefinitionField, BorderLayout.CENTER);
        editPanel.setVisible(false);

        JPanel buttonPanel = new JPanel(new FlowLayout());
        buttonPanel.add(changeLanguageButton);
        buttonPanel.add(editButton);
        buttonPanel.add(saveButton);
        buttonPanel.add(cancelButton);
        add(buttonPanel, BorderLayout.SOUTH);
        add(editPanel, BorderLayout.EAST);

        JPanel searchButtonPanel = new JPanel(new FlowLayout());
        searchButtonPanel.add(searchButton);
        searchButtonPanel.add(addWordButton);
        searchButtonPanel.add(deleteWordButton);
        searchPanel.add(searchButtonPanel, BorderLayout.EAST);

        // Initialize dictionary and language
        currentLanguage = "English"; // Initialize the current language to English
        initDictionary(currentLanguage + ".txt");
        setAllDefinitionsText();

        // Disable save and cancel buttons initially
        saveButton.setEnabled(false);
        cancelButton.setEnabled(false);

        // Add listeners
        searchButton.addActionListener(e -> searchWord());

        changeLanguageButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                changeLanguage();
            }
        });
        

        editButton.addActionListener(e -> {
            String searchTerm = searchField.getText().trim().toLowerCase();
            if (dictionary.containsKey(searchTerm)) {
                editPanel.setVisible(true);
                editWordField.setText(searchTerm);
                editDefinitionField.setText(dictionary.get(searchTerm));
                editDefinitionField.setCaretPosition(0);
                saveButton.setEnabled(true);
                cancelButton.setEnabled(true);
                selectedWord = searchTerm;
            } else {
                JOptionPane.showMessageDialog(this, "Word not found in the dictionary.", "Not Found",
                        JOptionPane.ERROR_MESSAGE);
            }
        });

        saveButton.addActionListener(e -> {
            String newWord = editWordField.getText().trim();
            String newDefinition = editDefinitionField.getText().trim();
            if (!newWord.isEmpty() && !newDefinition.isEmpty()) {
                if (selectedWord != null) {
                    dictionary.remove(selectedWord);
                    deleteWordFromDictionaryFile(selectedWord);
                }
                dictionary.put(newWord, newDefinition);
                addWordToDictionaryFile(newWord, newDefinition);
                setAllDefinitionsText();
                editPanel.setVisible(false);
                saveButton.setEnabled(false);
                cancelButton.setEnabled(false);
                editWordField.setText("");
                editDefinitionField.setText("");
            } else {
                JOptionPane.showMessageDialog(this, "Word and definition cannot be empty.", "Empty Fields",
                        JOptionPane.ERROR_MESSAGE);
            }
        });

        cancelButton.addActionListener(e -> {
            editPanel.setVisible(false);
            saveButton.setEnabled(false);
            cancelButton.setEnabled(false);
            editWordField.setText("");
            editDefinitionField.setText("");
        });

        addWordButton.addActionListener(e -> {
            editWordField.setText("");
            editDefinitionField.setText("");
            editPanel.setVisible(true);
            saveButton.setEnabled(true);
            cancelButton.setEnabled(true);
            selectedWord = null;
        });

        deleteWordButton.addActionListener(e -> {
            String searchTerm = searchField.getText().trim().toLowerCase();
            if (dictionary.containsKey(searchTerm)) {
                dictionary.remove(searchTerm);
                deleteWordFromDictionaryFile(searchTerm);
                setAllDefinitionsText();
            } else {
                JOptionPane.showMessageDialog(this, "Word not found in the dictionary.", "Not Found",
                        JOptionPane.ERROR_MESSAGE);
            }
        });
    }

    private void setAllDefinitionsText() {
        setAllDefinitionsText(false);
    }

    private void setAllDefinitionsText(boolean showDeleteSign) {
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> entry : dictionary.entrySet()) {
            if (showDeleteSign) {
                sb.append("- ");
            }
            sb.append(String.format("%s - %s%n%n", entry.getKey(), entry.getValue()));
        }
        definitionArea.setText(sb.toString());
    }

    private void initDictionary(String filename) {
        dictionary = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);
        try {
            BufferedReader reader = new BufferedReader(new FileReader(filename));
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(" - ");
                if (parts.length >= 2) {
                    String word = parts[0].trim();
                    String definition = parts[1].trim();
                    dictionary.put(word, definition);
                }
            }
            reader.close();
        } catch (IOException e) {
            e.printStackTrace();
            JOptionPane.showMessageDialog(this, "Error loading dictionary file.", "File Error",
                    JOptionPane.ERROR_MESSAGE);
        }
    }

    private void searchWord() {
        String searchTerm = searchField.getText().trim().toLowerCase();
        Highlighter highlighter = definitionArea.getHighlighter();
        highlighter.removeAllHighlights();

        if (dictionary.containsKey(searchTerm)) {
            String definition = dictionary.get(searchTerm);
            String definitionsText = definitionArea.getText();
            int startIndex = definitionsText.indexOf(searchTerm);
            int endIndex = startIndex + searchTerm.length() + definition.length() + 3; // 3 for " - "

            try {
                highlighter.addHighlight(startIndex, endIndex,
                        new DefaultHighlighter.DefaultHighlightPainter(Color.YELLOW));
                Rectangle viewRect = definitionArea.modelToView(startIndex);
                definitionArea.scrollRectToVisible(viewRect);
            } catch (BadLocationException e) {
                e.printStackTrace();
            }
        } else {
            JOptionPane.showMessageDialog(this, "Word not found in the dictionary.", "Not Found",
                    JOptionPane.ERROR_MESSAGE);
        }
    }

    private void changeLanguage() {
        String[] languages = { "English", "French", "Dutch", "Spanish", "Chinese" };
        JComboBox<String> languageComboBox = new JComboBox<>(languages);
        int result = JOptionPane.showConfirmDialog(this, languageComboBox, "Select Language",
                JOptionPane.OK_CANCEL_OPTION, JOptionPane.QUESTION_MESSAGE);

        if (result == JOptionPane.OK_OPTION) {
            String selectedLanguage = (String) languageComboBox.getSelectedItem();
            if (!currentLanguage.equals(selectedLanguage)) {
                currentLanguage = selectedLanguage;
                initDictionary(currentLanguage + ".txt");
                setAllDefinitionsText();
            }
        }
    }

    private void editWord() {
        String searchTerm = searchField.getText().trim().toLowerCase();
        if (dictionary.containsKey(searchTerm)) {
            definitionArea.setEditable(true);
            saveButton.setEnabled(true);
            cancelButton.setEnabled(true);
            selectedWord = searchTerm;
        } else {
            JOptionPane.showMessageDialog(this, "Word not found in the dictionary.", "Not Found",
                    JOptionPane.ERROR_MESSAGE);
        }
    }

    private void saveChanges() {
        String newText = definitionArea.getText();
        int startIndex = newText.indexOf(selectedWord);
        int endIndex = newText.indexOf("\n\n", startIndex);
        if (endIndex == -1) {
            endIndex = newText.length();
        }
        String newDefinition = newText.substring(startIndex + selectedWord.length() + 3, endIndex);

        dictionary.put(selectedWord, newDefinition);
        setAllDefinitionsText();
        definitionArea.setEditable(false);
        saveButton.setEnabled(false);
        cancelButton.setEnabled(false);
    }

    private void cancelChanges() {
        definitionArea.setEditable(false);
        saveButton.setEnabled(false);
        cancelButton.setEnabled(false);
        setAllDefinitionsText();
    }

    private void addWordToDictionaryFile(String word, String definition) {
        try {
            FileWriter writer = new FileWriter(currentLanguage + ".txt", true);
            BufferedWriter bufferedWriter = new BufferedWriter(writer);
            bufferedWriter.write(word + " - " + definition + "\n");
            bufferedWriter.close();
        } catch (IOException e) {
            e.printStackTrace();
            JOptionPane.showMessageDialog(this, "Error saving word to dictionary file.", "File Error",
                    JOptionPane.ERROR_MESSAGE);
        }
    }
    
    private void deleteWordFromDictionaryFile(String word) {
        try {
            File inputFile = new File(currentLanguage + ".txt");
            File tempFile = new File("temp.txt");
    
            BufferedReader reader = new BufferedReader(new FileReader(inputFile));
            BufferedWriter writer = new BufferedWriter(new FileWriter(tempFile));
    
            String lineToRemove = word;
            String currentLine;
    
            while ((currentLine = reader.readLine()) != null) {
                if (!currentLine.startsWith(lineToRemove)) {
                    writer.write(currentLine + "\n");
                }
            }
            writer.close();
            reader.close();
            inputFile.delete();
            tempFile.renameTo(inputFile);
        } catch (IOException e) {
            e.printStackTrace();
            JOptionPane.showMessageDialog(this, "Error deleting word from dictionary file.", "File Error",
                    JOptionPane.ERROR_MESSAGE);
        }
    }    

    public static void main(String[] args) {
        DictionaryGUI gui = new DictionaryGUI();
        gui.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        gui.setVisible(true);
    }
}
