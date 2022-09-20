import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Pressable,
  TextInput,
  ScrollView,
  Alert,
  Platform
 } from 'react-native';
import { theme } from './colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Fontisto, Feather } from '@expo/vector-icons';


const STORAGE_KEY = "@toDos"
const STORAGE_KEY_default = "@default"
const iconSize = 14


export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [done, setDone] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingText, setEditingText] = useState();

  const travel = async () => {
    setWorking(false)
    try { await AsyncStorage.setItem(STORAGE_KEY_default, 'false') }
    catch (e) { }
  };
  const work = async () => {
    setWorking(true)
    try { await AsyncStorage.setItem(STORAGE_KEY_default, 'true') }
    catch (e) { }
  };

  const onChangeText = (payload) => setText(payload);
  const onChangeEditingText = (payload) => setEditingText(payload);

  const saveToDos = async (toSave) => {
    // (https://react-native-async-storage.github.io/async-storage/docs/usage/)
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    } catch (e) {
      // saving error
    }
  } 

  const loadToDos = async () => {
    const s = await AsyncStorage.getItem(STORAGE_KEY);
    // console.log(s, JSON.parse(s))
    setToDos(JSON.parse(s))

    const s2 = await AsyncStorage.getItem(STORAGE_KEY_default);
    setWorking(s2 === 'true')
  }

  const addToDo = async () => {
    if(text === "") {
      return;
    }  
    const newToDos = {
        ...toDos, 
        [Date.now()]: {text, done, editing, working}, 
    }
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText('');
  }
  // console.log(toDos)

  const deleteToDos = (key) => {
    if(Platform.OS === 'web') {
      const ok = confirm("Do you want to delete this To Do")
      if(ok) {
        const newToDos = {...toDos}
        delete newToDos[key]
        setToDos(newToDos);
        saveToDos(newToDos);
      }
    }
    else {
      Alert.alert('Delete To Do?', 'Are you sure?', [
        {text: 'Cancel'},
        {
          text: "I'm sure",
          onPress: () => {
            // creating completely new object with a content of the state
            const newToDos = {...toDos}
            delete newToDos[key]
            setToDos(newToDos);
            saveToDos(newToDos);
          },
        }
      ])
    }
    return;
  }

  const updateStatus = async (key) => {
      const newToDos = {...toDos}
      newToDos[key].done = !newToDos[key].done
      setToDos(newToDos);
      await saveToDos(newToDos);
      // setText('');
      // console.log(newToDos)
  }

  const editToDos = (key) => {
      const newToDos = {...toDos}
      Object.keys(toDos).map(id => {
        if(id === key) {
          newToDos[key].editing = !newToDos[key].editing
        }
        else {
          newToDos[id].editing = false; 
        }
      })
      
      setToDos(newToDos);
      setEditingText(newToDos[key].text)
  }

  const updateToDos = async (key) => {
    const newToDos = {...toDos}
    newToDos[key].editing = false; 
    newToDos[key].text = editingText
    setToDos(newToDos);
    await saveToDos(newToDos);
    // console.log(newToDos)
}


  //// COMPONENT MOUNTS
  useEffect(() => {
    loadToDos();
  }, [])

  // useEffect(() => {
  //   console.log(editingText)
  //   const newToDos = {...toDos}
  //   console.log(newToDos)
  // }, [editingText])

  //// RETURN
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />


      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
            <Text style={{...styles.btnText, color: working? 'white': theme.grey}}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
            <Text style={{...styles.btnText, color: working? theme.grey: 'white'}}>Travel</Text>
        </TouchableOpacity>
      </View>


      <View>
        <TextInput 
          keyboardType='default'
          returnKeyType='done'
          onSubmitEditing={addToDo}
          value={text}
          onChangeText={onChangeText}
          placeholder={working? 'Add a To Do': 'Where do you want to go?'}
          style={styles.input} 
        />
        <ScrollView>
          {Object.keys(toDos).map(key => (
            toDos[key].working === working 
            ? 
              <View style={styles.toDo} key={key}>
                {
                  toDos[key].editing
                  ? 
                    <TextInput 
                      returnKeyType='done'
                      onSubmitEditing={() => updateToDos(key)}
                      onChangeText={onChangeEditingText}
                      value={editingText}
                      placeholder={editingText}
                      style={styles.inputEdit} 
                    />
                  : 
                    (
                      toDos[key].done 
                      ? <Text style={{...styles.toDoText, textDecorationLine: 'line-through', color: '#777'}}>{toDos[key].text}</Text>
                      : <Text style={styles.toDoText}>{toDos[key].text}</Text>
                    )
                }
     
                
                {/* ICONS */}
                <View style={styles.icons}>
                  <TouchableOpacity onPress={() => editToDos(key)} >
                      <Feather name="edit-2" size={iconSize} color="rgba(255,255,255,0.7)" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => updateStatus(key)}>
                    {
                      toDos[key].done 
                      ? <Fontisto name="checkbox-active" size={iconSize} color="rgba(255,255,255,0.7)" />
                      : <Fontisto name="checkbox-passive" size={iconSize} color='rgba(255,255,255,0.7)' />
                    }
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteToDos(key)}>
                      <Fontisto name="trash" size={iconSize} color={'rgba(255,255,255,0.7)'} />
                  </TouchableOpacity>
                </View>
              </View>
            : null
          ))}
        </ScrollView>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    marginTop: 100,
    justifyContent: "space-between",
  },
  btnText: {
    fontSize: 43,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18
  },
  toDo: {
    backgroundColor: theme.grey,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 15,
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'space-between'
  },
  toDoText: {
    color: 'white',
    fontSize: 16,
    fontWeight: "500"
  },
  icons: {
    flexDirection: 'row', 
    width: iconSize*4.6,
    justifyContent: "space-between",
  },
  inputEdit: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginVertical: 0,
    fontSize: 16,
    borderBottomColor: 'white',
    borderBottomWidth: 1,
    color: 'white'
  },
});
