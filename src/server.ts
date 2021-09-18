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
  getDoc,
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
  const users = [];
  querySnapshot.forEach((doc) => {
    const user = { id: doc.id, ...doc.data() };
    users.push(user);
  });
  res.send(users);
});

app.get('/users', async (req, res) => {
  const querySnapshot = await getDocs(collection(db, 'users'));
  const users = [];
  querySnapshot.forEach((doc) => users.push(doc.data()));
  res.send(users);
});

app.get('/users/:id', async (req, res) => {
  const id = req.params.id;
  const docRef = doc(db, 'users', id);
  const user = await getDoc(docRef);
  if (user.exists()) {
    res.send(user.data());
  } else {
    res.status(400).json('No user with given id.');
  }
});

app.post('/signin', async (req, res) => {
  const id = req.body.id;
  const password = req.body.password;
  const docRef = doc(db, 'users', id);
  const user = await getDoc(docRef);
  const hash = Md5.hashStr(password) as string;
  console.log('password: ', hash === user.data().password);
  if (hash === user.data().password) {
    res.send(user.data());
  } else {
    res.status(400).json('Wrong credentials.');
  }
});

app.post('/users', async (req, res) => {
  const user: NewUser = req.body;
  const id = uuid();
  const name = user.name;
  const email = user.email;
  const hash = Md5.hashStr(user.password) as string;
  await setDoc(doc(db, 'list', id), { id: id, email: email, name: name });
  await setDoc(doc(db, 'users', id), { id: id, email: email, name: name, password: hash, gifts: [], friends: [] });
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
