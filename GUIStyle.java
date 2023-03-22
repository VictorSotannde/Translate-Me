import javax.swing.*;
import java.awt.*;

public class GUIStyle {
    public static void applyStyle(JFrame frame) {
        frame.getContentPane().setBackground(new Color(237, 221, 196));
    }

    public static void applyStyle(JButton button, ButtonType buttonType) {
        switch (buttonType) {
            case SAVE:
                button.setBackground(new Color(76, 175, 80));
                break;
            case CANCEL:
                button.setBackground(new Color(244, 67, 54));
                break;
            case CHANGE_LANGUAGE:
                button.setBackground(new Color(33, 33, 33));
                break;
            case EDIT:
                button.setBackground(new Color(30, 136, 229));
                break;
            default:
                button.setBackground(new Color(60, 170, 255));
                break;
        }
        button.setForeground(Color.WHITE);
        button.setFont(new Font("Arial", Font.BOLD, 16));
        button.setOpaque(true); 
        button.setBorderPainted(false); 
    }

    public static void applyStyle(JTextField textField) {
        textField.setFont(new Font("Arial", Font.PLAIN, 16));
        textField.setBackground(new Color(253, 246, 227));
    }

    public static void applyStyle(JTextPane textPane) {
        textPane.setFont(new Font("Arial", Font.PLAIN, 16));
        textPane.setMargin(new Insets(10, 10, 10, 10));
        textPane.setBackground(new Color(253, 246, 227));
    }

    public enum ButtonType {
        SAVE, CANCEL, CHANGE_LANGUAGE, EDIT, DEFAULT
    }
}
