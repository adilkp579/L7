/* ===== L7 Digital Hub — Shared App Logic ===== */

/* Helpers */
const $  = (q,root=document)=>root.querySelector(q);
const $$ = (q,root=document)=>Array.from(root.querySelectorAll(q));

/* Highlight selected category */
document.addEventListener("DOMContentLoaded",()=>{
  const page = location.pathname.split("/").pop();
  $(`[data-key]`)?.classList?.remove("active");
  const match = document.querySelector(`[data-key="${page.replace('.html','')}"]`);
  if(match) match.classList.add("active");
});

/* ===== Firebase Setup ===== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const firebaseConfig = {
 apiKey: "AIzaSyC2tsSd3o7QkBu8dhYVLrvVsGUJxBhKQZk",
 authDomain: "l7-digital-hub.firebaseapp.com",
 projectId: "l7-digital-hub",
 storageBucket: "l7-digital-hub.firebasestorage.app",
 messagingSenderId: "103483875623",
 appId: "1:103483875623:web:4057e34f23edd51e02c902",
 measurementId: "G-X2CCL0YB6P"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

/* ===== Product Store (uses Firestore) ===== */
window.DB = {

 async all(){
   const snap = await getDocs(collection(db,"products"));
   return snap.docs.map(d=>({id:d.id,...d.data()}));
 },

 async add(p){
   await addDoc(collection(db,"products"), {
     name:p.name,
     category:p.category,
     condition:p.condition,
     price:Number(p.price),
     mrp:Number(p.mrp),
     image:p.image,
     createdAt:serverTimestamp()
   });
 },

 async update(p){
   await updateDoc(doc(db,"products",p.id),{
     name:p.name, category:p.category, condition:p.condition,
     price:Number(p.price), mrp:Number(p.mrp), image:p.image
   });
 },

 async remove(id){
   await deleteDoc(doc(db,"products",id));
 },

 async filter(category, condition=null){
   let qRef = query(collection(db,"products"), where("category","==",category));
   if(condition) qRef = query(collection(db,"products"), where("category","==",category), where("condition","==",condition));
   const snap = await getDocs(qRef);
   return snap.docs.map(d=>({id:d.id,...d.data()}));
 }
};

/* ===== Cart (Local Storage) ===== */
const Cart = (()=>{
 const KEY="l7_cart_items_v2";
 const get =()=>JSON.parse(localStorage.getItem(KEY)||"[]");
 const set =(x)=>localStorage.setItem(KEY,JSON.stringify(x));
 function add(p){
   const items=get();
   const f=items.find(x=>x.id===p.id);
   if(f) f.qty++;
   else items.push({...p,qty:1});
   set(items); updateBadge();
 }
 function updateBadge(){
   const b=$("#cart-badge"); if(!b) return;
   const count = get().reduce((s,x)=>s+x.qty,0);
   b.textContent=count;
   b.style.display = count>0?"inline-block":"none";
 }
 return {add,updateBadge};
})();
window.Cart = Cart;

/* Attach add buttons */
window.bindAddButtons = (root)=>{
 $$(".btn[data-product]",root).forEach(btn=>{
   btn.onclick = ()=>{
     Cart.add(JSON.parse(btn.dataset.product));
     btn.textContent="Added ✓";
     setTimeout(()=>btn.textContent="Add to Cart",900);
   };
 });
};
