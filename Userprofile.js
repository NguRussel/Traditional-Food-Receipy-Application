import React, { useState, useEffect, createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import {
View,
Text,
ScrollView,
TouchableOpacity,
TextInput,
Image,
Alert,
StyleSheet,
SafeAreaView,
FlatList,
Modal,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Types
function User(props) {
    return (
        <View>
            <Text>{props.id}</Text>
            <Text>{props.name}</Text>
            <Text>{props.email}</Text>
            <Text>{props.avatar}</Text>
            <Text>{props.bio}</Text>
            <Text>{props.location}</Text>
        </View>
    );
}

function DietaryPreference(props) {
    return (
        <View>
            <Text>{props.id}</Text>
            <Text>{props.name}</Text>
            <Text>{props.selected.toString()}</Text>
        </View>
    );
}

function Allergy(props) {
    return (
        <View>
            <Text>{props.id}</Text>
            <Text>{props.name}</Text>
            <Text>{props.severity}</Text>
        </View>
    );
}

function Recipe(props) {
    return (
        <View>
            <Text>{props.id}</Text>
            <Text>{props.title}</Text>
            <Text>{props.image}</Text>
            <Text>{props.cookTime}</Text>
            <Text>{props.servings}</Text>
            <Text>{props.difficulty}</Text>
            <Text>{props.ingredients.join(', ')}</Text>
            <Text>{props.instructions.join(', ')}</Text>
        </View>
    );
}

function MealPlan(props) {
    return (
        <View>
            <Text>{props.id}</Text>
            <Text>{props.name}</Text>
            <Text>{props.weekStart}</Text>
            <Text>{JSON.stringify(props.meals)}</Text>
        </View>
    );
}

// Create Context
const AppContext = createContext();

const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within AppProvider');
    }
    return context;
};

// Define prop types for data structures
const userPropTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    avatar: PropTypes.string.isRequired,
    bio: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
};

const recipePropTypes = {
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    cookTime: PropTypes.number.isRequired,
    servings: PropTypes.number.isRequired,
    difficulty: PropTypes.oneOf(['easy', 'medium', 'hard']).isRequired,
    ingredients: PropTypes.arrayOf(PropTypes.string).isRequired,
    instructions: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const allergyPropTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    severity: PropTypes.oneOf(['mild', 'moderate', 'severe']).isRequired,
};

const dietaryPreferencePropTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    selected: PropTypes.bool.isRequired,
};

const mealPlanPropTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    weekStart: PropTypes.string.isRequired,
    meals: PropTypes.object.isRequired,
};

// Sample data
const sampleUser = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://via.placeholder.com/100',
    bio: 'Food enthusiast and home cook',
    location: 'New York, NY',
};

const sampleDietaryPreferences = [
    { id: '1', name: 'Vegetarian', selected: false },
    { id: '2', name: 'Vegan', selected: false },
    { id: '3', name: 'Gluten-Free', selected: false },
    { id: '4', name: 'Keto', selected: false },
    { id: '5', name: 'Low-Carb', selected: false },
    { id: '6', name: 'Paleo', selected: false },
];

const sampleAllergies = [
    { id: '1', name: 'Nuts', severity: 'severe' },
    { id: '2', name: 'Dairy', severity: 'mild' },
];

const sampleRecipes = [
    {
        id: '1',
        title: 'Spaghetti Carbonara',
        image: 'https://via.placeholder.com/200',
        cookTime: 30,
        servings: 4,
        difficulty: 'medium',
        ingredients: ['Spaghetti', 'Eggs', 'Bacon', 'Parmesan', 'Black Pepper'],
        instructions: ['Boil pasta', 'Cook bacon', 'Mix eggs and cheese', 'Combine all'],
    },
    {
        id: '2',
        title: 'Caesar Salad',
        image: 'https://via.placeholder.com/200',
        cookTime: 15,
        servings: 2,
        difficulty: 'easy',
        ingredients: ['Romaine', 'Croutons', 'Parmesan', 'Caesar Dressing'],
        instructions: ['Chop lettuce', 'Add croutons', 'Toss with dressing'],
    },
];

// App Provider Component
function AppProvider({ children }) {
    const [user, setUser] = useState(sampleUser);
    const [dietaryPreferences, setDietaryPreferences] = useState(sampleDietaryPreferences);
    const [allergies, setAllergies] = useState(sampleAllergies);
    const [favoriteRecipes, setFavoriteRecipes] = useState(sampleRecipes);
    const [mealPlans, setMealPlans] = useState([]);

    const value = {
        user,
        setUser,
        dietaryPreferences,
        setDietaryPreferences,
        allergies,
        setAllergies,
        favoriteRecipes,
        setFavoriteRecipes,
        mealPlans,
        setMealPlans,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

AppProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

// Profile Screen
function ProfileScreen({ navigation }) {
    const { user, favoriteRecipes, mealPlans } = useAppContext();

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.profileHeader}>
                    <Image 
                        source={{ uri: user.avatar }} 
                        style={styles.avatar}
                        defaultSource={{ uri: 'https://via.placeholder.com/100' }}
                    />
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    <Text style={styles.userBio}>{user.bio}</Text>
                    <Text style={styles.userLocation}>{user.location}</Text>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{favoriteRecipes.length}</Text>
                        <Text style={styles.statLabel}>Favorites</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{mealPlans.length}</Text>
                        <Text style={styles.statLabel}>Meal Plans</Text>
                    </View>
                </View>

                <View style={styles.menuContainer}>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('EditProfile')}
                    >
                        <Text style={styles.menuItemText}>Edit Profile</Text>
                        <Text style={styles.menuArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('Preferences')}
                    >
                        <Text style={styles.menuItemText}>Dietary Preferences</Text>
                        <Text style={styles.menuArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('Favorites')}
                    >
                        <Text style={styles.menuItemText}>Favorite Recipes</Text>
                        <Text style={styles.menuArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('MealPlanner')}
                    >
                        <Text style={styles.menuItemText}>Meal Planner</Text>
                        <Text style={styles.menuArrow}>›</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

ProfileScreen.propTypes = {
    navigation: PropTypes.shape({
        navigate: PropTypes.func.isRequired,
    }).isRequired,
};

// Edit Profile Screen
function EditProfileScreen({ navigation }) {
    const { user, setUser } = useAppContext();
    const [formData, setFormData] = useState(user);

    const handleSave = () => {
        if (!formData.name || !formData.email) {
            Alert.alert('Error', 'Name and email are required');
            return;
        }

        setUser(formData);
        Alert.alert('Success', 'Profile updated successfully!');
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.formContainer}>
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Name</Text>
                    <TextInput
                        style={styles.textInput}
                        value={formData.name}
                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                        placeholder="Enter your name"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <TextInput
                        style={styles.textInput}
                        value={formData.email}
                        onChangeText={(text) => setFormData({ ...formData, email: text })}
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Bio</Text>
                    <TextInput
                        style={[styles.textInput, styles.textArea]}
                        value={formData.bio}
                        onChangeText={(text) => setFormData({ ...formData, bio: text })}
                        placeholder="Tell us about yourself"
                        multiline
                        numberOfLines={4}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Location</Text>
                    <TextInput
                        style={styles.textInput}
                        value={formData.location}
                        onChangeText={(text) => setFormData({ ...formData, location: text })}
                        placeholder="Enter your location"
                    />
                </View>

                <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
                    <Text style={styles.primaryButtonText}>Save Changes</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

EditProfileScreen.propTypes = {
    navigation: PropTypes.shape({
        goBack: PropTypes.func.isRequired,
    }).isRequired,
};

// Preferences Screen
function PreferencesScreen() {
    const { dietaryPreferences, setDietaryPreferences, allergies, setAllergies } = useAppContext();
    const [showAllergyModal, setShowAllergyModal] = useState(false);
    const [newAllergy, setNewAllergy] = useState({ name: '', severity: 'mild' });

    const togglePreference = (id) => {
        setDietaryPreferences(
            dietaryPreferences.map((pref) =>
                pref.id === id ? { ...pref, selected: !pref.selected } : pref
            )
        );
    };

    const addAllergy = () => {
        if (!newAllergy.name.trim()) {
            Alert.alert('Error', 'Please enter an allergy name');
            return;
        }

        const allergy = {
            id: Date.now().toString(),
            name: newAllergy.name.trim(),
            severity: newAllergy.severity,
        };
        setAllergies([...allergies, allergy]);
        setNewAllergy({ name: '', severity: 'mild' });
        setShowAllergyModal(false);
    };

    const removeAllergy = (id) => {
        Alert.alert(
            'Remove Allergy',
            'Are you sure you want to remove this allergy?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => setAllergies(allergies.filter((allergy) => allergy.id !== id)),
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Dietary Preferences</Text>
                    {dietaryPreferences.map((pref) => (
                        <TouchableOpacity
                            key={pref.id}
                            style={styles.preferenceItem}
                            onPress={() => togglePreference(pref.id)}
                        >
                            <Text style={styles.preferenceText}>{pref.name}</Text>
                            <View style={[styles.checkbox, pref.selected && styles.checkboxSelected]}>
                                {pref.selected && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Allergies</Text>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => setShowAllergyModal(true)}
                        >
                            <Text style={styles.addButtonText}>+ Add</Text>
                        </TouchableOpacity>
                    </View>
                    
                    {allergies.map((allergy) => (
                        <View key={allergy.id} style={styles.allergyItem}>
                            <View>
                                <Text style={styles.allergyName}>{allergy.name}</Text>
                                <Text style={styles.allergySeverity}>Severity: {allergy.severity}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => removeAllergy(allergy.id)}
                            >
                                <Text style={styles.removeButtonText}>Remove</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                <Modal visible={showAllergyModal} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Add Allergy</Text>
                            
                            <TextInput
                                style={styles.textInput}
                                placeholder="Allergy name"
                                value={newAllergy.name}
                                onChangeText={(text) => setNewAllergy({ ...newAllergy, name: text })}
                            />
                            
                            <Text style={styles.inputLabel}>Severity</Text>
                            <View style={styles.severityButtons}>
                                {['mild', 'moderate', 'severe'].map((severity) => (
                                <TouchableOpacity
                                    key={severity}
                                    style={[
                                    styles.severityButton,
                                    newAllergy.severity === severity && styles.severityButtonSelected,
                                    ]}
                                    onPress={() => setNewAllergy({ ...newAllergy, severity })}
                                >
                                    <Text
                                    style={[
                                        styles.severityButtonText,
                                        newAllergy.severity === severity && styles.severityButtonTextSelected,
                                    ]}
                                    >
                                    {severity}
                                    </Text>
                                </TouchableOpacity>
                                ))}
                            </View>
                            
                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                style={styles.modalButton}
                                onPress={() => setShowAllergyModal(false)}
                                >
                                <Text style={styles.modalButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                style={[styles.primaryButton, !newAllergy.name.trim() && styles.primaryButtonDisabled]} 
                                onPress={addAllergy}
                                disabled={!newAllergy.name.trim()}
                                >
                                <Text style={styles.primaryButtonText}>Add</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </SafeAreaView>
    );
}

PreferencesScreen.propTypes = {
    dietaryPreferences: PropTypes.arrayOf(PropTypes.shape(dietaryPreferencePropTypes)),
    allergies: PropTypes.arrayOf(PropTypes.shape(allergyPropTypes)),
};

PreferencesScreen.defaultProps = {
    dietaryPreferences: [],
    allergies: [],
};

// Favorites Screen
function FavoritesScreen() {
    const { favoriteRecipes, setFavoriteRecipes } = useAppContext();

    const removeFavorite = (id) => {
        Alert.alert(
            'Remove Recipe',
            'Are you sure you want to remove this recipe from favorites?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => setFavoriteRecipes(favoriteRecipes.filter((recipe) => recipe.id !== id)),
                },
            ]
        );
    };

    const renderRecipe = ({ item }) => (
        <View style={styles.recipeCard}>
            <Image 
                source={{ uri: item.image }} 
                style={styles.recipeImage}
                defaultSource={{ uri: 'https://via.placeholder.com/200' }}
            />
            <View style={styles.recipeInfo}>
                <Text style={styles.recipeTitle}>{item.title}</Text>
                <Text style={styles.recipeDetails}>
                    {item.cookTime} min • {item.servings} servings • {item.difficulty}
                </Text>
                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeFavorite(item.id)}
                >
                    <Text style={styles.removeButtonText}>Remove from Favorites</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {favoriteRecipes.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No favorite recipes yet</Text>
                    <Text style={styles.emptyStateSubtext}>
                        Start exploring recipes and add them to your favorites!
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={favoriteRecipes}
                    renderItem={renderRecipe}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.recipeList}
                />
            )}
        </SafeAreaView>
    );
}

FavoritesScreen.propTypes = {
    favoriteRecipes: PropTypes.arrayOf(PropTypes.shape(recipePropTypes)),
};

FavoritesScreen.defaultProps = {
    favoriteRecipes: [],
};

// Meal Planner Screen
function MealPlannerScreen({ navigation }) {
    const { mealPlans, setMealPlans } = useAppContext();

    const createNewMealPlan = () => {
        const newPlan = {
            id: Date.now().toString(),
            name: `Meal Plan ${mealPlans.length + 1}`,
            weekStart: new Date().toISOString().split('T')[0],
            meals: {},
        };
        setMealPlans([...mealPlans, newPlan]);
        navigation.navigate('MealPlanDetail', { planId: newPlan.id });
    };

    const deleteMealPlan = (id) => {
        Alert.alert(
            'Delete Meal Plan',
            'Are you sure you want to delete this meal plan?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => setMealPlans(mealPlans.filter((plan) => plan.id !== id)),
                },
            ]
        );
    };

    const renderMealPlan = ({ item }) => (
        <View style={styles.mealPlanCard}>
            <View style={styles.mealPlanInfo}>
                <Text style={styles.mealPlanName}>{item.name}</Text>
                <Text style={styles.mealPlanDate}>Week of {item.weekStart}</Text>
            </View>
            <View style={styles.mealPlanActions}>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => navigation.navigate('MealPlanDetail', { planId: item.id })}
                >
                    <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteMealPlan(item.id)}
                >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.primaryButton} onPress={createNewMealPlan}>
                    <Text style={styles.primaryButtonText}>Create New Meal Plan</Text>
                </TouchableOpacity>
            </View>

            {mealPlans.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No meal plans yet</Text>
                    <Text style={styles.emptyStateSubtext}>
                        Create your first meal plan to get started!
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={mealPlans}
                    renderItem={renderMealPlan}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.mealPlanList}
                />
            )}
        </SafeAreaView>
    );
}

MealPlannerScreen.propTypes = {
    navigation: PropTypes.shape({
        navigate: PropTypes.func.isRequired,
    }).isRequired,
};

// Meal Plan Detail Screen
function MealPlanDetailScreen({ route, navigation }) {
    const { planId } = route.params;
    const { mealPlans, setMealPlans, favoriteRecipes } = useAppContext();
    const [mealPlan, setMealPlan] = useState(null);
    const [showRecipeModal, setShowRecipeModal] = useState(false);
    const [selectedDay, setSelectedDay] = useState('');
    const [selectedMealType, setSelectedMealType] = useState('');

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];

    useEffect(() => {
        const plan = mealPlans.find((p) => p.id === planId);
        if (plan) {
            setMealPlan(plan);
        } else {
            Alert.alert('Error', 'Meal plan not found');
            navigation.goBack();
        }
    }, [planId, mealPlans]);

    const updateMealPlan = (updatedPlan) => {
        setMealPlan(updatedPlan);
        setMealPlans(mealPlans.map((p) => (p.id === planId ? updatedPlan : p)));
    };

    const addRecipeToMeal = (recipe) => {
        if (!mealPlan || !selectedDay || !selectedMealType) {
            Alert.alert('Error', 'Invalid meal plan data');
            return;
        }

        const updatedMeals = { ...mealPlan.meals };
        if (!updatedMeals[selectedDay]) {
            updatedMeals[selectedDay] = {};
        }

        if (selectedMealType === 'snacks') {
            updatedMeals[selectedDay].snacks = updatedMeals[selectedDay].snacks || [];
            updatedMeals[selectedDay].snacks.push(recipe);
        } else {
            updatedMeals[selectedDay][selectedMealType] = recipe;
        }

        updateMealPlan({ ...mealPlan, meals: updatedMeals });
        setShowRecipeModal(false);
    };

    const removeRecipeFromMeal = (day, mealType, recipeIndex) => {
        const updatedMeals = { ...mealPlan.meals };
        
        if (mealType === 'snacks') {
            updatedMeals[day].snacks.splice(recipeIndex, 1);
            if (updatedMeals[day].snacks.length === 0) {
                delete updatedMeals[day].snacks;
            }
        } else {
            delete updatedMeals[day][mealType];
        }

        if (Object.keys(updatedMeals[day]).length === 0) {
            delete updatedMeals[day];
        }

        updateMealPlan({ ...mealPlan, meals: updatedMeals });
    };

    const openRecipeModal = (day, mealType) => {
        setSelectedDay(day);
        setSelectedMealType(mealType);
        setShowRecipeModal(true);
    };

    if (!mealPlan) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.header}>
                    <TextInput
                        style={styles.mealPlanTitleInput}
                        value={mealPlan.name}
                        onChangeText={(text) => updateMealPlan({ ...mealPlan, name: text })}
                        placeholder="Meal Plan Name"
                    />
                </View>

                {days.map((day) => (
                    <View key={day} style={styles.dayContainer}>
                        <Text style={styles.dayTitle}>{day}</Text>
                        
                        {mealTypes.map((mealType) => (
                            <View key={mealType} style={styles.mealContainer}>
                                <Text style={styles.mealType}>
                                    {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                                </Text>
                                
                                {mealPlan.meals[day]?.[mealType] ? (
                                    mealType === 'snacks' ? (
                                        <View>
                                            {(mealPlan.meals[day].snacks || []).map((snack, index) => (
                                                <View key={index} style={styles.mealItem}>
                                                    <Text style={styles.mealItemText}>{snack.title}</Text>
                                                    <TouchableOpacity
                                                        style={styles.removeMealButton}
                                                        onPress={() => removeRecipeFromMeal(day, mealType, index)}
                                                    >
                                                        <Text style={styles.removeMealButtonText}>Remove</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                            <TouchableOpacity
                                                style={styles.addMealButton}
                                                onPress={() => openRecipeModal(day, mealType)}
                                            >
                                                <Text style={styles.addMealButtonText}>+ Add Snack</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <View style={styles.mealItem}>
                                            <Text style={styles.mealItemText}>
                                                {mealPlan.meals[day][mealType].title}
                                            </Text>
                                            <TouchableOpacity
                                                style={styles.removeMealButton}
                                                onPress={() => removeRecipeFromMeal(day, mealType)}
                                            >
                                                <Text style={styles.removeMealButtonText}>Remove</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )
                                ) : (
                                    <TouchableOpacity
                                        style={styles.addMealButton}
                                        onPress={() => openRecipeModal(day, mealType)}
                                    >
                                        <Text style={styles.addMealButtonText}>
                                            + Add {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}
                    </View>
                ))}

                <Modal visible={showRecipeModal} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Select Recipe</Text>
                            <FlatList
                                data={favoriteRecipes}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.recipeOption}
                                        onPress={() => addRecipeToMeal(item)}
                                    >
                                        <Text style={styles.recipeOptionText}>{item.title}</Text>
                                    </TouchableOpacity>
                                )}
                                keyExtractor={(item) => item.id}
                                ListEmptyComponent={
                                    <Text style={styles.emptyStateText}>No favorite recipes available</Text>
                                }
                            />
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={() => setShowRecipeModal(false)}
                            >
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </SafeAreaView>
    );
}

MealPlanDetailScreen.propTypes = {
    route: PropTypes.shape({
        params: PropTypes.shape({
            planId: PropTypes.string.isRequired,
        }).isRequired,
    }).isRequired,
    navigation: PropTypes.shape({
        goBack: PropTypes.func.isRequired,
    }).isRequired,
};

// Navigation Stack
const Stack = createStackNavigator();

function ProfileStack() {
    return (
        <Stack.Navigator
            initialRouteName="Profile"
            screenOptions={{
                headerStyle: { backgroundColor: '#D8BEE3FF' },
                headerTintColor: 'white',
                headerTitleStyle: { fontWeight: 'bold' },
            }}
        >
            <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: 'Profile' }}
            />
            <Stack.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{ title: 'Edit Profile' }}
            />
            <Stack.Screen
                name="Preferences"
                component={PreferencesScreen}
                options={{ title: 'Preferences' }}
            />
            <Stack.Screen
                name="Favorites"
                component={FavoritesScreen}
                options={{ title: 'Favorites' }}
            />
            <Stack.Screen
                name="MealPlanner"
                component={MealPlannerScreen}
                options={{ title: 'Meal Planner' }}
            />
            <Stack.Screen
                name="MealPlanDetail"
                component={MealPlanDetailScreen}
                options={{ title: 'Meal Plan Details' }}
            />
        </Stack.Navigator>
    );
}

// Main App Component
function App() {
    return (
        <AppProvider>
            <NavigationContainer>
                <ProfileStack />
            </NavigationContainer>
        </AppProvider>
    );
}

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ABAA8CFF',
    },
    header: {
        padding: 20,
        backgroundColor: 'white',
        marginBottom: 10,
    },
    profileHeader: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
        marginBottom: 10,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 15,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    userEmail: {
        fontSize: 16,
        color: '#666',
        marginBottom: 10,
    },
    userBio: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 5,
    },
    userLocation: {
        fontSize: 14,
        color: '#666',
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        marginBottom: 10,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
    },
    menuContainer: {
        backgroundColor: 'white',
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    menuItemText: {
        fontSize: 16,
    },
    menuArrow: {
        fontSize: 20,
        color: '#AFECF0FF',
    },
    formContainer: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: 'white',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    primaryButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    primaryButtonDisabled: {
        backgroundColor: '#ccc',
    },
    section: {
        backgroundColor: 'white',
        margin: 10,
        borderRadius: 8,
        padding: 15,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    preferenceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    preferenceText: {
        fontSize: 16,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: '#ddd',
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxSelected: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    checkmark: {
        color: 'white',
        fontWeight: 'bold',
    },
    addButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 5,
    },
    addButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    recipeCard: {
        flexDirection: 'row',
        backgroundColor: 'white',
        margin: 10,
        borderRadius: 8,
        padding: 10,
        elevation: 2,
    },
    recipeImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 10,
    },
    recipeInfo: {
        flex: 1,
    },
    recipeTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    recipeDetails: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    removeButton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    removeButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    mealPlanCard: {
        backgroundColor: 'white',
        margin: 10,
        borderRadius: 8,
        padding: 15,
        elevation: 2,
    },
    mealPlanInfo: {
        flex: 1,
    },
    mealPlanName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    mealPlanDate: {
        fontSize: 14,
        color: '#666',
    },
    mealPlanActions: {
        flexDirection: 'row',
        marginTop: 10,
    },
    editButton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 5,
        marginRight: 10,
    },
    editButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    deleteButton: {
        backgroundColor: '#ff5252',
        padding: 10,
        borderRadius: 5,
    },
    deleteButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    dayContainer: {
        backgroundColor: 'white',
        margin: 10,
        borderRadius: 8,
        padding: 15,
    },
    dayTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    mealContainer: {
        marginBottom: 15,
    },
    mealType: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#666',
    },
    mealItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 10,
        borderRadius: 5,
        marginBottom: 5,
    },
    mealItemText: {
        fontSize: 14,
        flex: 1,
    },
    addMealButton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 5,
    },
    addMealButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        width: '90%',
        maxHeight: '80%',
        borderRadius: 10,
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    modalButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    modalButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    recipeOption: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    recipeOptionText: {
        fontSize: 16,
    },
    severityButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    severityButton: {
        flex: 1,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    severityButtonSelected: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    severityButtonText: {
        fontSize: 14,
        color: '#666',
    },
    severityButtonTextSelected: {
        color: 'white',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#666',
    },
    removeMealButton: {
        backgroundColor: '#ff5252',
        padding: 8,
        borderRadius: 5,
        marginLeft: 10,
    },
    removeMealButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    mealPlanTitleInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: 'white',
    },
    recipeList: {
        padding: 10,
    },
    mealPlanList: {
        padding: 10,
    },
});

export default App;