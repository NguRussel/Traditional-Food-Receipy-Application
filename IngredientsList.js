import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PropTypes from "prop-types";

export default function IngredientsList(props) {
const { ingredients, servings, baseServings = 4, onAddToShopping } = props;
const multiplier = servings / baseServings;

const adjustAmount = (amount) => {
    const numericAmount = Number.parseFloat(amount);
    if (isNaN(numericAmount)) return amount;

    const adjusted = numericAmount * multiplier;
    return adjusted % 1 === 0 ? adjusted.toString() : adjusted.toFixed(1);
};

const getIngredientKey = (ingredient) => {
    // Create a unique key using ingredient properties
    return `${ingredient.name}-${ingredient.amount}-${ingredient.unit}`.toLowerCase().replace(/\s+/g, '-');
};

return (
    <View style={styles.container}>
    {ingredients.map((ingredient) => (
    <View key={getIngredientKey(ingredient)} style={styles.ingredientItem}>
        <Text style={styles.ingredientAmount}>
            {adjustAmount(ingredient.amount)} {ingredient.unit}
        </Text>
        <Text style={styles.ingredientName}>{ingredient.name}</Text>
        </View>
    ))}

    {onAddToShopping && (
        <TouchableOpacity style={styles.addToShoppingButton} onPress={onAddToShopping}>
        <Ionicons name="add-circle-outline" size={20} color="#FF6B6B" />
        <Text style={styles.addToShoppingText}>Add all to Shopping List</Text>
        </TouchableOpacity>
    )}
    </View>
);
}

IngredientsList.propTypes = {
    ingredients: PropTypes.arrayOf(
        PropTypes.shape({
        name: PropTypes.string.isRequired,
        amount: PropTypes.string.isRequired,
        unit: PropTypes.string.isRequired,
        })
    ).isRequired,
    servings: PropTypes.number.isRequired,
    baseServings: PropTypes.number,
    onAddToShopping: PropTypes.func,
};

IngredientsList.defaultProps = {
    baseServings: 4,
};

const styles = StyleSheet.create({
container: {
    gap: 12,
},
ingredientItem: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EDCF89FF",
},
ingredientAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF6B6B",
    width: 80,
},
ingredientName: {
    fontSize: 14,
    color: "#333",
    flex: 1,
},
addToShoppingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#FF6B6B",
    borderRadius: 8,
},
addToShoppingText: {
    fontSize: 14,
    color: "#FF6B6B",
    fontWeight: "500",
},
});
