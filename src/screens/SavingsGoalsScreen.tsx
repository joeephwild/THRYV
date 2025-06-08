import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  StatusBar,
  Modal,
  TextInput,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { addGoal, updateGoal, depositToGoalAndUpdateStreak, Goal, selectGoals } from '../store/slices/goalsSlice';
import { RootState, useAppDispatch } from '../store';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { COLORS, SIZES } from '../constants/theme';

const SavingsGoalsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const goals = useSelector((state: RootState) => selectGoals(state));
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Deposit Modal State
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [selectedGoalForDeposit, setSelectedGoalForDeposit] = useState<Goal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  // Form state for creating/editing goals
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalDeadline, setGoalDeadline] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (editingGoal) {
      setGoalName(editingGoal.name);
      setGoalTarget(editingGoal.targetAmount.toString());
      setGoalDeadline(editingGoal.deadline ? new Date(editingGoal.deadline) : undefined);
    } else {
      // Reset form for new goal
      setGoalName('');
      setGoalTarget('');
      setGoalDeadline(undefined);
    }
  }, [editingGoal, modalVisible]);

  const openModalForNewGoal = () => {
    setEditingGoal(null);
    setModalVisible(true);
  };

  const openModalForEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setModalVisible(true);
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setGoalDeadline(selectedDate);
    }
  };

  const handleSubmitGoal = () => {
    if (goalName.trim() === '' || goalTarget.trim() === '') {
      Alert.alert('Validation Error', 'Please enter goal name and target amount.');
      return;
    }
    const targetAmount = parseFloat(goalTarget);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid target amount.');
      return;
    }

    const goalData = {
      name: goalName,
      targetAmount: targetAmount,
      deadline: goalDeadline ? goalDeadline.toISOString().split('T')[0] : undefined,
      // icon: 'star' // Default icon or let user choose for new goals
    };

    if (editingGoal) {
      dispatch(updateGoal({ ...editingGoal, ...goalData }));
    } else {
      dispatch(addGoal(goalData as Omit<Goal, 'id' | 'currentAmount' | 'createdAt'>));
    }
    setModalVisible(false);
    setEditingGoal(null); // Reset editing state
  };

  const openDepositModal = (goal: Goal) => {
    setSelectedGoalForDeposit(goal);
    setDepositAmount('');
    setDepositModalVisible(true);
  };

  const handleConfirmDeposit = () => {
    if (!selectedGoalForDeposit || depositAmount.trim() === '') {
      Alert.alert('Validation Error', 'Please enter a deposit amount.');
      return;
    }
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid positive amount.');
      return;
    }

    dispatch(depositToGoalAndUpdateStreak({ goalId: selectedGoalForDeposit.id, amount }));
    setDepositModalVisible(false);
    setSelectedGoalForDeposit(null);
    setDepositAmount('');
  };

  const renderGoalItem = ({ item }: { item: Goal }) => (
    <LinearGradient
      colors={['#FFD700', '#FFA500']} // Example gradient colors
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.goalItemContainer}
    >
      <View style={styles.goalInfo}>
        <Ionicons name={item.icon as any || 'star'} size={30} color="#fff" style={styles.goalIcon} />
        <View>
          <Text style={styles.goalName}>{item.name}</Text>
          <Text style={styles.goalProgress}>
            ${item.currentAmount.toFixed(2)} / ${item.targetAmount.toFixed(2)}
          </Text>
          {item.deadline && (
            <Text style={styles.goalDeadline}>
              Deadline: {new Date(item.deadline).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>
      <TouchableOpacity onPress={() => openModalForEditGoal(item)} style={styles.editButton}>
        <Ionicons name="pencil" size={20} color="#fff" />
      </TouchableOpacity>
      {/* Deposit Button */}
      <TouchableOpacity onPress={() => openDepositModal(item)} style={[styles.editButton, { right: 50, top: 10 /* Adjust position if needed */ }]}>
        <Ionicons name="cash-outline" size={22} color="#fff" />
      </TouchableOpacity>
      <View style={styles.progressBarBackground}>
        <View style={[
          styles.progressBarForeground,
          { width: `${(item.currentAmount / item.targetAmount) * 100}%` }
        ]} />
      </View>
    </LinearGradient>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Savings Goals</Text>
        <TouchableOpacity onPress={openModalForNewGoal} style={styles.addButton}>
          <Ionicons name="add-circle" size={36} color={COLORS.yellow || '#FFDE59'} />
        </TouchableOpacity>
      </View>

      {goals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="sad-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No savings goals yet.</Text>
          <Text style={styles.emptySubText}>Tap the '+' button to create your first goal!</Text>
        </View>
      ) : (
        <FlatList
          data={goals}
          renderItem={renderGoalItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Goal Name (e.g., New Laptop)"
              value={goalName}
              onChangeText={setGoalName}
            />
            <TextInput
              style={styles.input}
              placeholder="Target Amount (e.g., 1500)"
              value={goalTarget}
              onChangeText={setGoalTarget}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.datePickerButtonText}>
                {goalDeadline ? goalDeadline.toLocaleDateString() : 'Select Deadline (Optional)'}
              </Text>
              <Ionicons name="calendar-outline" size={20} color={COLORS.gray || '#888'} />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={goalDeadline || new Date()} // Default to today if no deadline set
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()} // Optional: prevent past dates
              />
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.button, styles.buttonClose]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.textStyle}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.buttonCreate]}
                onPress={handleSubmitGoal} // Changed to handleSubmitGoal
              >
                <Text style={styles.textStyle}>{editingGoal ? 'Save' : 'Create'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Deposit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={depositModalVisible}
        onRequestClose={() => setDepositModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Deposit to "{selectedGoalForDeposit?.name}"</Text>
            <TextInput
              style={styles.input}
              placeholder="Amount to Deposit"
              value={depositAmount}
              onChangeText={setDepositAmount}
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.button, styles.buttonClose]}
                onPress={() => setDepositModalVisible(false)}
              >
                <Text style={styles.textStyle}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.buttonCreate /* Consider a different color for deposit */]}
                onPress={handleConfirmDeposit}
              >
                <Text style={styles.textStyle}>Confirm Deposit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFBEB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.medium || 20,
    paddingTop: SIZES.medium || 20,
    paddingBottom: (SIZES.medium || 20) / 2,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: SIZES.large || 24,
    fontWeight: 'bold',
    color: '#0A0B0F',
  },
  addButton: {
    padding: 5,
  },
  listContainer: {
    padding: SIZES.medium || 20,
  },
  goalItemContainer: {
    padding: SIZES.medium || 15,
    borderRadius: SIZES.small || 10,
    marginBottom: SIZES.medium || 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  goalIcon: {
    marginRight: 15,
  },
  editButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
  },
  goalName: {
    fontSize: SIZES.medium || 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  goalProgress: {
    fontSize: SIZES.xSmall || 14,
    color: '#f0f0f0',
  },
  goalDeadline: {
    fontSize: SIZES.xSmall || 12,
    color: '#e0e0e0',
    marginTop: 4,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarForeground: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: SIZES.medium || 18,
    color: '#aaa',
    marginTop: 10,
    fontWeight: 'bold'
  },
  emptySubText: {
    fontSize: SIZES.small || 16,
    color: '#bbb',
    marginTop: 5,
    textAlign: 'center',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxHeight: '80%'
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: SIZES.medium || 20,
    fontWeight: 'bold',
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: SIZES.small || 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    width: '100%',
  },
  datePickerButtonText: {
    fontSize: SIZES.small || 16,
    color: '#555',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: SIZES.small || 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    width: '100%',
    fontSize: SIZES.small || 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  button: {
    borderRadius: SIZES.small || 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    elevation: 2,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonClose: {
    backgroundColor: '#f0f0f0',
  },
  buttonCreate: {
    backgroundColor: COLORS.yellow || '#FFDE59',
  },
  textStyle: {
    color: '#0A0B0F',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: SIZES.small || 16
  },
});

export default SavingsGoalsScreen;
