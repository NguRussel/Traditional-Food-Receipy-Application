import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Ingredient {
name: string;
amount: string;
unit: string;
}

interface IngredientsListProps {
ingredients: Ingredient[];
servings: number;
baseServings?: number;
onAddToShopping?: () => void;
}

const IngredientsList: React.FC<IngredientsListProps> = ({
ingredients,
servings,
baseServings = 4,
onAddToShopping,
}) => {
const multiplier = servings / baseServings;

const adjustAmount = (amount: string): string => {
    const numericAmount = Number.parseFloat(amount);
    if (isNaN(numericAmount)) return amount;

    const adjusted = numericAmount * multiplier;
    return adjusted % 1 === 0 ? adjusted.toString() : adjusted.toFixed(1);
};

return (
    <View style={styles.container}>
    {ingredients.map((ingredient, index) => (
        <View key={index} style={styles.ingredientItem}>
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
};

const styles = StyleSheet.create({
container: {
    gap: 12,
},
ingredientItem: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E69FFF",
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

export default IngredientsList;