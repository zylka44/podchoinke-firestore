import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  updateDoc,
  doc,
  serverTimestamp,
  getDocs,
  deleteDoc,
  setDoc,
} from 'firebase/firestore';
import { NewUser, User } from 'models';
import { uuid } from 'uuidv4';
import { Md5 } from 'ts-md5';

const firebaseConfig = {
  apiKey: 'AIzaSyBWmUbsXUFTUpKDTAnSDfTP7EiIfxs8TWQ',
  authDomain: 'podchoinke-dev.firebaseapp.com',
  databaseURL: 'https://podchoinke-dev-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'podchoinke-dev',
  storageBucket: 'podchoinke-dev.appspot.com',
  messagingSenderId: '717772155176',
  appId: '1:717772155176:web:b924cbdf33ae240494081d',
};

const firestore = initializeApp(firebaseConfig);
const db = getFirestore(firestore);
const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('podchoinke firestore is working');
});

app.get('/list', async (req, res) => {
  const querySnapshot = await getDocs(collection(db, 'list'));
  res.send(querySnapshot);
});

app.get('/users', async (req, res) => {
  const querySnapshot = await getDocs(collection(db, 'users'));
  res.send(querySnapshot);
});

app.post('/users', async (req, res) => {
  const user: NewUser = req.body;
  const id = uuid();
  const name = user.name;
  const hash = Md5.hashStr(user.password) as string;
  await setDoc(doc(db, 'list', id), { name: name });
  await setDoc(doc(db, 'users', id), { id: id, name: name, password: hash, gifts: [], friends: [] });
  res.send('user added successfuly');
});

app.patch('/users/:id', async (req, res) => {
  const user: User = req.body;
  const id = req.params.id;
  const userToUpdate = doc(db, 'users', id);
  await updateDoc(userToUpdate, { timestamp: serverTimestamp(), ...user });
  res.send('seccessfuly updated');
});

app.delete('/users/:id', async (req, res) => {
  const id = req.params.id;
  await deleteDoc(doc(db, 'list', id));
  await deleteDoc(doc(db, 'users', id));
  res.send('successfuly deleted');
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`api is running on port ${port}`);
});
