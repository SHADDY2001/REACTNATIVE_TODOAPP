// App.js
// Modern React Native To‑Do app with a glassy, gradient look, smooth interactions, and clean architecture — all in ONE file.
// ✅ Works great with Expo. Minimal deps: expo-linear-gradient, expo-blur, @expo/vector-icons
// -----------------------------------------------------------
// Quick Start (Expo):
//   npx create-expo-app modern-todo
//   cd modern-todo
//   npx expo install expo-linear-gradient expo-blur @expo/vector-icons
//   Replace App.js with this file
//   npx expo start
// -----------------------------------------------------------

import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

// Utility: nice shadow across iOS + Android
const shadow = (elevation = 8) => ({
  shadowColor: '#000',
  shadowOpacity: 0.15,
  shadowRadius: elevation,
  shadowOffset: { width: 0, height: Math.ceil(elevation / 2) },
  elevation,
});

// Neon-ish category chips
const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'work', label: 'Work' },
  { key: 'personal', label: 'Personal' },
  { key: 'study', label: 'Study' },
  { key: 'fitness', label: 'Fitness' },
];

export default function App() {
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Design splash screen', category: 'work', done: false },
    { id: '2', title: 'Revise React hooks', category: 'study', done: true },
    { id: '3', title: 'Leg day workout', category: 'fitness', done: false },
  ]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [newTask, setNewTask] = useState('');
  const [newCategory, setNewCategory] = useState('work');
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      const byCat = category === 'all' || t.category === category;
      const byQuery = t.title.toLowerCase().includes(query.toLowerCase());
      return byCat && byQuery;
    });
  }, [tasks, query, category]);

  const toggleDone = (id) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const removeTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const addTask = () => {
    const title = newTask.trim();
    if (!title) return;
    setTasks(prev => [
      { id: Date.now().toString(), title, category: newCategory, done: false },
      ...prev,
    ]);
    setNewTask('');
    setSheetOpen(false);
  };

  return (
    <LinearGradient colors={["#0f1021", "#1b1c3a", "#11121f"]} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <BlurBadge>
              <Ionicons name="checkmark-done" size={18} />
            </BlurBadge>
            <Text style={styles.appTitle}>Focus Tasks</Text>
          </View>
          <Pressable onPress={() => setSheetOpen(true)} style={({ pressed }) => [styles.addBtn, pressed && { transform: [{ scale: 0.98 }] }]}>
            <Ionicons name="add" size={26} color="#0f1021" />
          </Pressable>
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color="#bfc3ff" />
          <TextInput
            placeholder="Search tasks…"
            placeholderTextColor="#9aa0d6"
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
          />
          {query?.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <Feather name="x" size={18} color="#bfc3ff" />
            </Pressable>
          )}
        </View>

        {/* Categories */}
        <FlatList
          data={CATEGORIES}
          keyExtractor={(i) => i.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 6 }}
          style={{ maxHeight: 44 }}
          renderItem={({ item }) => (
            <CategoryPill
              active={category === item.key}
              label={item.label}
              onPress={() => setCategory(item.key)}
            />
          )}
        />

        {/* Task List */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 160 }}
          renderItem={({ item }) => (
            <TaskCard
              title={item.title}
              done={item.done}
              category={item.category}
              onToggle={() => toggleDone(item.id)}
              onDelete={() => removeTask(item.id)}
            />
          )}
          ListEmptyComponent={() => (
            <View style={{ paddingTop: 60, alignItems: 'center', opacity: 0.8 }}>
              <Ionicons name="sparkles" size={24} color="#bfc3ff" />
              <Text style={{ color: '#cdd1ff', marginTop: 10 }}>Nothing here — add a task.</Text>
            </View>
          )}
        />

        {/* Add Task Bottom Sheet */}
        {sheetOpen && (
          <AddTaskSheet
            newTask={newTask}
            setNewTask={setNewTask}
            newCategory={newCategory}
            setNewCategory={setNewCategory}
            onClose={() => setSheetOpen(false)}
            onAdd={addTask}
          />)
        }
      </SafeAreaView>
    </LinearGradient>
  );
}

function BlurBadge({ children }) {
  return (
    <BlurView intensity={20} tint="dark" style={[styles.badge, shadow(8)]}>
      <Text style={{ color: '#d6d9ff' }}>{children}</Text>
    </BlurView>
  );
}

function CategoryPill({ label, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.pill, active && styles.pillActive, pressed && { opacity: 0.9 }]}>
      <Text style={[styles.pillText, active && { color: '#0f1021' }]}>{label}</Text>
    </Pressable>
  );
}

function TaskCard({ title, done, onToggle, onDelete, category }) {
  const slideX = useRef(new Animated.Value(0)).current;
  const opacity = slideX.interpolate({ inputRange: [-120, 0], outputRange: [0.7, 1] });

  const onLongPress = () => {
    Animated.timing(slideX, {
      toValue: -80,
      duration: 160,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };
  const onPressOut = () => {
    Animated.timing(slideX, {
      toValue: 0,
      duration: 150,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ translateX: slideX }], opacity }}>
      <Pressable onLongPress={onLongPress} onPressOut={onPressOut} style={({ pressed }) => [styles.card, shadow(12), pressed && { transform: [{ scale: 0.995 }] }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
          <Check done={done} onToggle={onToggle} />
          <View style={{ flex: 1 }}>
            <Text numberOfLines={2} style={[styles.cardTitle, done && styles.cardTitleDone]}>{title}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <View style={[styles.dot, { backgroundColor: dotColor(category) }]} />
              <Text style={styles.cardSub}>{capitalize(category)}</Text>
            </View>
          </View>
          <Pressable onPress={onDelete} hitSlop={10}>
            <MaterialIcons name="delete-outline" size={22} color="#ff9aa2" />
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function Check({ done, onToggle }) {
  const scale = useRef(new Animated.Value(done ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.spring(scale, { toValue: done ? 1 : 0, useNativeDriver: true, friction: 6, tension: 120 }).start();
  }, [done]);

  return (
    <Pressable onPress={onToggle} style={({ pressed }) => [styles.checkWrap, pressed && { opacity: 0.9 }]}>
      <View style={styles.checkBox}> 
        <Animated.View style={{ transform: [{ scale }] }}>
          {done ? <Ionicons name="checkmark" size={16} color="#0f1021" /> : null}
        </Animated.View>
      </View>
    </Pressable>
  );
}

function AddTaskSheet({ newTask, setNewTask, newCategory, setNewCategory, onClose, onAdd }) {
  const slide = useRef(new Animated.Value(0)).current; // 0 -> hidden, 1 -> visible
  React.useEffect(() => {
    Animated.timing(slide, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, []);

  const translateY = slide.interpolate({ inputRange: [0, 1], outputRange: [300, 0] });
  const overlayOpacity = slide.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <View style={StyleSheet.absoluteFill}>
      <Pressable onPress={onClose} style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.35)' }]} />
      <Animated.View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, transform: [{ translateY }] }}>
        <BlurView intensity={30} tint="dark" style={[styles.sheet, shadow(18)]}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Add Task</Text>

          <View style={styles.sheetRow}>
            <Ionicons name="document-text-outline" size={18} color="#cdd1ff" />
            <TextInput
              placeholder="Task title…"
              placeholderTextColor="#9aa0d6"
              value={newTask}
              onChangeText={setNewTask}
              style={styles.sheetInput}
              returnKeyType="done"
              onSubmitEditing={onAdd}
            />
          </View>

          <View style={[styles.sheetRow, { marginTop: 12 }]}>
            <Ionicons name="pricetag-outline" size={18} color="#cdd1ff" />
            <FlatList
              data={CATEGORIES.filter(c => c.key !== 'all')}
              keyExtractor={(i) => i.key}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
              renderItem={({ item }) => (
                <Pressable onPress={() => setNewCategory(item.key)} style={[styles.selectPill, newCategory === item.key && styles.selectPillActive]}>
                  <Text style={[styles.selectPillText, newCategory === item.key && { color: '#0f1021' }]}>{item.label}</Text>
                </Pressable>
              )}
            />
          </View>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <Pressable onPress={onAdd} style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9 }]}>
              <Ionicons name="sparkles" size={18} color="#0f1021" />
              <Text style={styles.primaryBtnText}>Add Task</Text>
            </Pressable>
          </KeyboardAvoidingView>

          <Pressable onPress={onClose} style={{ alignSelf: 'center', padding: 10, marginTop: 4 }}>
            <Text style={{ color: '#9aa0d6' }}>Cancel</Text>
          </Pressable>
        </BlurView>
      </Animated.View>
    </View>
  );
}

// Helpers
const dotColor = (key) => ({
  work: '#7dd3fc',
  personal: '#fda4af',
  study: '#c4b5fd',
  fitness: '#86efac',
}[key] || '#a5b4fc');
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Styles
const styles = StyleSheet.create({
  headerRow: {
    paddingHorizontal: 20,
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#e7e9ff',
    letterSpacing: 0.5,
  },
  addBtn: {
    backgroundColor: '#b6f09c',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    ...shadow(10),
  },
  searchWrap: {
    marginTop: 16,
    marginHorizontal: 20,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    ...shadow(6),
  },
  searchInput: {
    flex: 1,
    color: '#e6e8ff',
    fontSize: 15,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginRight: 10,
  },
  pillActive: {
    backgroundColor: '#b6f09c',
    borderColor: '#b6f09c',
  },
  pillText: {
    color: '#e6e8ff',
    fontWeight: '600',
  },
  card: {
    marginTop: 14,
    borderRadius: 20,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardTitle: {
    color: '#e8eaff',
    fontSize: 16,
    fontWeight: '700',
  },
  cardTitleDone: {
    color: '#c7ccff',
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  cardSub: {
    color: '#b8bcf2',
    fontSize: 12,
    fontWeight: '600',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    opacity: 0.9,
  },
  checkWrap: { justifyContent: 'center', alignItems: 'center' },
  checkBox: {
    width: 22,
    height: 22,
    borderRadius: 8,
    backgroundColor: '#b6f09c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)'
  },
  sheet: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    backgroundColor: 'rgba(17,18,31,0.7)',
  },
  sheetHandle: {
    width: 56,
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignSelf: 'center',
    marginBottom: 10,
  },
  sheetTitle: {
    color: '#e7e9ff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sheetInput: {
    flex: 1,
    color: '#e7e9ff',
    fontSize: 15,
  },
  selectPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)'
  },
  selectPillActive: {
    backgroundColor: '#b6f09c',
    borderColor: '#b6f09c',
  },
  selectPillText: {
    color: '#e6e8ff',
    fontWeight: '700',
  },
  primaryBtn: {
    marginTop: 16,
    backgroundColor: '#b6f09c',
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryBtnText: {
    color: '#0f1021',
    fontWeight: '800',
    fontSize: 16,
  },
});
