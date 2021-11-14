import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, updateDoc, doc, getDocs, deleteDoc, setDoc, getDoc } from 'firebase/firestore';
import { Group, NewUser, UserUpdate } from 'models';
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

app.get('/groups/', async (req, res) => {
  const querySnapshot = await getDocs(collection(db, 'groups'));
  const groups = [];
  querySnapshot.forEach((doc) => {
    const { id, name, admin, members } = doc.data();
    groups.push({ id, name, admin, members });
  });
  res.send(groups);
});

app.post('/add-group', async (req, res) => {
  const group: Group = req.body;
  const id = uuid();
  const { name, password, admin } = group;
  const hash = Md5.hashStr(password) as string;
  await setDoc(doc(db, 'groups', id), {
    id,
    name,
    password: hash,
    admin,
    members: [admin],
  });
  const docRef = doc(db, 'groups', id);
  const groupRes = await getDoc(docRef);
  const groupData = groupRes.data();
  const newGroup = {
    id: groupData.id,
    name: groupData.name,
    admin: groupData.admin,
    members: groupData.members,
  };
  res.send(newGroup);
});

app.patch('/group/:id', async (req, res) => {
  const id = req.params.id;
  const { password, member } = req.body;
  const docRef = doc(db, 'groups', id);
  const group = await getDoc(docRef);
  const hash = Md5.hashStr(password) as string;
  if (hash === group.data().password) {
    const currentMembers = group.data().members;
    const groupToUpdate = doc(db, 'groups', id);
    await updateDoc(groupToUpdate, { members: [...currentMembers, member] });
    const updatedDocRef = doc(db, 'groups', id);
    const updatedGroup = await getDoc(updatedDocRef);
    const { name, admin, members } = updatedGroup.data();
    res.send({ id, name, admin, members });
  } else {
    res.status(400).json('Wrong credentials.');
  }
});

app.patch('/leave/:id', async (req, res) => {
  const id = req.params.id;
  const member = req.body.member;
  const docRef = doc(db, 'groups', id);
  const group = await getDoc(docRef);
  const updatedMembers = group.data().members.filter((m) => m !== member);
  const updatedGroup = { ...group.data(), members: updatedMembers };
  const groupToUpdate = doc(db, 'groups', id);
  await updateDoc(groupToUpdate, updatedGroup);
  res.send(updatedGroup);
});

app.delete('/group/:id', async (req, res) => {
  const id = req.params.id;
  await deleteDoc(doc(db, 'groups', id));
  res.send(id);
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
