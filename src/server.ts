import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
  arrayUnion,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';

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
  res.send('podchoinke firestore is working happily!');
});

app.get('/products', async (req, res) => {
  const querySnapshot = await getDocs(collection(db, 'users'));
  querySnapshot.forEach((doc) => {
    console.log(`${doc.id} => ${doc.data().name}`);
  });
  res.send('successfuly downloaded');
});

app.post('/products', async (req, res) => {
  const data = req.body;
  await addDoc(collection(db, 'users'), { timestamp: serverTimestamp(), ...data });
  res.send('ok');
});

app.patch('/products', async (req, res) => {
  const data = req.body;
  const userToUpdate = doc(db, 'users', '0ln9Lmpc7vIPAhyOhh38');
  //aktualizacja całego dokumentu
  // await updateDoc(userToUpdate, {timestamp: serverTimestamp(), ...data});

  // aktualizacja jednego pola dolumentu
  await updateDoc(userToUpdate, {
    presents: data.presents,
  });

  // dodawanie elementu do tablicy
  await updateDoc(userToUpdate, {
    presents: arrayUnion(data.presents),
  });

  res.send('seccessfuly updated');
});

app.delete('/products', async (req, res) => {
  await deleteDoc(doc(db, 'users', '0ln9Lmpc7vIPAhyOhh38'));
  res.send('successfuly deleted');
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`api is running on port ${process.env.PORT || 3000}`);
});
