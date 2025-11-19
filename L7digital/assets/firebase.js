<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
  import { getFirestore, collection, addDoc, setDoc, getDoc, getDocs, doc, query, where, orderBy, serverTimestamp } 
    from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
  import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } 
    from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-analytics.js";

  const firebaseConfig = {
    apiKey: "AIzaSyC2tsSd3o7QkBu8dhYVLrvVsGUJxBhKQZk",
    authDomain: "l7-digital-hub.firebaseapp.com",
    projectId: "l7-digital-hub",
    storageBucket: "l7-digital-hub.firebasestorage.app",
    messagingSenderId: "103483875623",
    appId: "1:103483875623:web:4057e34f23edd51e02c902",
    measurementId: "G-X2CCL0YB6P"
  };

  // Init
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);
  // (Analytics works only on https / localhost)
  getAnalytics(app);

  // --- Minimal DB wrapper you can reuse ---
  window.DB = {
    // Create
    async addProduct(p){
      const docRef = await addDoc(collection(db, 'products'), {
        name: p.name,
        category: p.category,                 // 'mobile' | 'laptop' | 'pouches' | 'electronics'
        condition: p.condition || 'new',      // 'new' | 'second'
        price: Number(p.price),
        mrp: Number(p.mrp),
        image: p.image,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...p };
    },
    // Update
    async updateProduct(id, p){
      await setDoc(doc(db,'products',id), {
        name: p.name,
        category: p.category,
        condition: p.condition || 'new',
        price: Number(p.price),
        mrp: Number(p.mrp),
        image: p.image,
        createdAt: serverTimestamp()
      }, { merge:true });
    },
    // Delete
    async deleteProduct(id){
      await setDoc(doc(db,'products',id), { __deleted: true }, { merge: true }); // or use deleteDoc if you prefer hard delete
      // import { deleteDoc } from ".../firebase-firestore.js" and call deleteDoc(doc(db,'products',id));
    },
    // Get one
    async getProduct(id){
      const snap = await getDoc(doc(db,'products',id));
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    },
    // List (with optional filters)
    async listProducts({category=null, condition=null}={}){
      let qRef = collection(db,'products');
      const constraints = [];
      if(category)  constraints.push(where('category','==',category));
      if(condition) constraints.push(where('condition','==',condition));
      constraints.push(orderBy('createdAt','desc'));
      const qry = constraints.length ? query(qRef, ...constraints) : query(qRef, orderBy('createdAt','desc'));
      const snap = await getDocs(qry);
      return snap.docs.map(d=>({ id:d.id, ...d.data() }));
    }
  };

  // --- Auth helpers (use for your admin gate if you like) ---
  window.FirebaseAuth = {
    signIn(email, password){ return signInWithEmailAndPassword(auth, email, password); },
    signOut(){ return signOut(auth); },
    onAuth(cb){ return onAuthStateChanged(auth, cb); }
  };
</script>
