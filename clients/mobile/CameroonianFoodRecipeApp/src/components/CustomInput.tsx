import {TextInput, StyleSheet, TextInputProps} from 'react-native';

type CustomInputProps = {
    placeholder: string;
} & TextInputProps;
export default function CustomInput(props: CustomInputProps) {
    return (
        <TextInput {...props} style={[styles.input, props.style]}  />
    )
}

const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        padding: 10,
        borderRadius: 5,
        borderColor: '#ccc',
    },
});