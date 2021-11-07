import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, updateDoc, doc, getDocs, deleteDoc, setDoc, getDoc } from 'firebase/firestore';
import { NewUser, User, UserUpdate } from 'models';
import { uuid } from 'uuidv4';
import { Md5 } from 'ts-md5';

const firebaseConfig = {
  apiKey: 'AIzaSyC_YhgF4FRS2BGe2EPj6ToDEQHu7cR3oA0',
  authDomain: 'podchoinke-dd836.firebaseapp.com',
  databaseURL: 'https://podchoinke-dd836.firebaseio.com',
  projectId: 'podchoinke-dd836',
  storageBucket: 'podchoinke-dd836.appspot.com',
  messagingSenderId: '22205214738',
  appId: '1:22205214738:web:0c778e8df3ba1756e1a8cb',
};

const firestore = initializeApp(firebaseConfig);
const db = getFirestore(firestore);
const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('podchoinke firestore is working');
});

app.get('/users', async (req, res) => {
  const querySnapshot = await getDocs(collection(db, 'users'));
  const users = [];
  querySnapshot.forEach((doc) => {
    const { id, name, email, friends } = doc.data();
    users.push({ id, name, email, friends });
  });
  res.send(users);
});

app.get('/users/:id', async (req, res) => {
  const id = req.params.id;
  const docRef = doc(db, 'users', id);
  const user = await getDoc(docRef);
  if (user.exists()) {
    const { name, email, friends, gifts } = user.data();
    res.send({ id, name, email, friends, gifts });
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
  if (hash === user.data().password) {
    const { name, email, friends, gifts } = user.data();
    res.send({ id, name, email, friends, gifts });
  } else {
    res.status(400).json('Wrong credentials.');
  }
});

app.post('/register', async (req, res) => {
  const user: NewUser = req.body;
  const id = uuid();
  const name = user.name;
  const email = user.email;
  const hash = Md5.hashStr(user.password) as string;
  await setDoc(doc(db, 'users', id), {
    id,
    email,
    name,
    password: hash,
    gifts: [],
    friends: [],
  });
  const docRef = doc(db, 'users', id);
  const userRes = await getDoc(docRef);
  const userData = userRes.data();
  const newUser = {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    friends: userData.friends,
  };
  res.send(newUser);
});

app.patch('/update/:id', async (req, res) => {
  const user: UserUpdate = req.body;
  const id = req.params.id;
  const userToUpdate = doc(db, 'users', id);
  await updateDoc(userToUpdate, { ...user });
  const docRef = doc(db, 'users', id);
  const userRes = await getDoc(docRef);
  const { name, email, friends, gifts } = userRes.data();
  res.send({ id, name, email, friends, gifts });
});

app.patch('/password-update/:id', async (req, res) => {
  const id = req.params.id;
  const userToUpdate = doc(db, 'users', id);
  const newPassword = req.body.password;
  const hash = Md5.hashStr(newPassword) as string;
  await updateDoc(userToUpdate, { password: hash });
  const docRef = doc(db, 'users', id);
  const userRes = await getDoc(docRef);
  const { name, email, friends, gifts } = userRes.data();
  res.send({ id, name, email, friends, gifts });
});

app.delete('/users/:id', async (req, res) => {
  const id = req.params.id;
  await deleteDoc(doc(db, 'users', id));
  res.send(id);
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`api is running on port ${port}`);
});
