import React, {useEffect, useMemo, useState} from 'react';
import ReactDOM from 'react-dom/client';
import {HashRouter, Routes, Route, Link, NavLink, useNavigate, useParams, useLocation} from 'react-router-dom';
import './styles.css';

const IMG = '/images';
const NAV_IMG = {
  home: {active:`${IMG}/navigation/home-green.png`, inactive:`${IMG}/navigation/home-black.png`},
  inventory: {active:`${IMG}/navigation/inventory-green.png`, inactive:`${IMG}/navigation/inventory-black.png`},
  add: {active:`${IMG}/navigation/add-green.png`, inactive:`${IMG}/navigation/add-black.png`},
  shopping: {active:`${IMG}/navigation/shopping-list-nav-green.png`, inactive:`${IMG}/navigation/shopping-list-nav-black.png`}
};
const QUICK_IMG = {
  inventory:`${IMG}/actions/inventory-green.png`,
  add:`${IMG}/actions/add-food-home.png`,
  shopping:`${IMG}/navigation/shopping-list-green.png`,
  guidance:`${IMG}/actions/food-guidance-home.png`
};

const seedFoods = [
  {id:1,name:'Milk',qty:'1 bottle',image:`${IMG}/food/milk.png`,meta:'Exp: 20 Sep 2026',status:'2 days left',category:'Dairy'},
  {id:2,name:'Chicken',qty:'2kg',image:`${IMG}/food/chicken.png`,meta:'Reminder: 21 Sep 2026',status:'Reminder: 3 days left',category:'Meat & Poultry'},
  {id:3,name:'Apple',qty:'5 pcs',image:`${IMG}/food/apple.png`,meta:'Reminder: 8 Oct 2026',status:'',category:'Fruits'},
  {id:4,name:'King Crab',qty:'3kg',image:`${IMG}/food/king-crab.png`,meta:'Reminder: 18 Oct 2026',status:'',category:'Seafood'},
  {id:5,name:'Broccoli',qty:'400 g',image:`${IMG}/food/broccoli.png`,meta:'Reminder: 30 Sep 2026',status:'',category:'Vegetables'}
];

const foodQuantities = {1:'1 bottle',2:'2kg',3:'5 pcs',4:'3kg',5:'400 g'};
const getFoodQty = food => food?.qty || foodQuantities[food?.id] || '-';

const formatAddedDate = (date=new Date()) => date.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}).replace(/^(\d{2})/,m=>String(Number(m)));
const formatInputDate = value => {
  if(!value) return '';
  const [year,month,day]=String(value).split('-').map(Number);
  if(!year || !month || !day) return value;
  return new Date(year,month-1,day).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
};
const addDaysToInputDate = (value,days) => {
  if(!value) return '';
  const [year,month,day]=String(value).split('-').map(Number);
  if(!year || !month || !day) return '';
  const date=new Date(year,month-1,day);
  date.setDate(date.getDate()+days);
  const y=date.getFullYear();
  const m=String(date.getMonth()+1).padStart(2,'0');
  const d=String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
};

const defaultShopping = [
  {id:1,name:'Milk',qty:'1 bottle',done:true,addedDate:'20 Oct 2026'},
  {id:2,name:'Egg',qty:'12 pcs',done:false,addedDate:formatAddedDate()},
  {id:3,name:'Bread',qty:'1 loaf',done:false,addedDate:formatAddedDate()},
  {id:4,name:'Chicken Breast',qty:'2 kg',done:false,addedDate:formatAddedDate()},
  {id:5,name:'Rice',qty:'5 kg',done:false,addedDate:formatAddedDate()}
];

function App(){
  const [foods,setFoods] = useState(()=>JSON.parse(localStorage.getItem('housefood-foods-v6')||'null')||seedFoods);
  const [shopping,setShopping] = useState(()=>{const saved=JSON.parse(localStorage.getItem('housefood-shopping-v6')||'null'); return (saved||defaultShopping).map(item=>({...item,addedDate:item.name==='Milk'?'20 Oct 2026':(item.addedDate||formatAddedDate())}));});
  useEffect(()=>localStorage.setItem('housefood-foods-v6',JSON.stringify(foods)),[foods]);
  useEffect(()=>localStorage.setItem('housefood-shopping-v6',JSON.stringify(shopping)),[shopping]);

  return <Routes>
    <Route path="/" element={<Home foods={foods}/>}/>
    <Route path="/inventory" element={<Inventory foods={foods} setFoods={setFoods}/>}/>
    <Route path="/food/:id" element={<FoodDetail foods={foods} setFoods={setFoods}/>}/>
    <Route path="/add-food" element={<AddFood setFoods={setFoods}/>}/>
    <Route path="/food-added" element={<FoodAdded/>}/>
    <Route path="/shopping" element={<Shopping shopping={shopping} setShopping={setShopping}/>}/>
    <Route path="/guidance" element={<GuidanceHub/>}/>
    <Route path="/food-storage-guidance" element={<FoodGuidance/>}/>
    <Route path="/guidance/fruits" element={<FruitsGuidance/>}/>
    <Route path="/expiring" element={<Expiring foods={foods}/>}/>
    <Route path="/expiry-guidance" element={<ExpiryGuidance/>}/>
    <Route path="/profile" element={<Profile/>}/>
  </Routes>;
}

function AssetIcon({name,className=''}){
  return <img className={`asset-icon ${className}`} src={`${IMG}/icons/${name}.svg`} alt="" aria-hidden="true"/>;
}

function Screen({children,active,back=false,title,className=''}){
  const nav=useNavigate();
  return <main className="app-stage">
    <section className={`phone-screen ${className}`}>
      {back && <button className="back-btn" onClick={()=>nav(-1)} aria-label="Back">&lt;</button>}
      {title && <h1 className="screen-title">{title}</h1>}
      <div className="screen-content">{children}</div>
      {active && <BottomNav active={active}/>} 
    </section>
  </main>;
}

function BottomNav({active}){
  const items=[
    ['/', 'home','home'],
    ['/inventory','inventory','inventory'],
    ['/add-food','add','add'],
    ['/shopping','shopping','shopping'],
    ['/profile','profile','profile'],
  ];
  return <nav className="bottom-nav">
    {items.map(([to,key,label])=><NavLink key={key} to={to} className={()=>`nav-item ${active===key?'active':''}`}>
      {key==='profile'
        ? <><AssetIcon name="profile"/><span>Profile</span></>
        : <img className="nav-image" src={NAV_IMG[key][active===key?'active':'inactive']} alt={label}/>
      }
    </NavLink>)}
  </nav>;
}

function QuickCard({to,icon,title,count}){
  const image = icon==='inventory' ? QUICK_IMG.inventory : icon==='add' ? QUICK_IMG.add : icon==='shopping' ? QUICK_IMG.shopping : icon==='book' ? QUICK_IMG.guidance : null;
  return <Link to={to} className="quick-card">
    {image ? <img className="quick-image" src={image} alt=""/> : <AssetIcon name={icon}/>} 
    <strong>{title}</strong>
    {count && <small>{count}</small>}
  </Link>;
}

function Home({foods}){
  return <Screen active="home" className="home-screen">
    <div className="welcome">Hello,<strong>Welcome Back!</strong></div>
    <div className="quick-grid">
      <QuickCard to="/inventory" icon="inventory" title={<>Food<br/>Inventory</>} count="5 items"/>
      <QuickCard to="/add-food" icon="add" title="Add Food"/>
      <QuickCard to="/shopping" icon="shopping" title="Shopping List" count="5 items"/>
      <QuickCard to="/guidance" icon="book" title={<>Food<br/>Guidance</>}/>
    </div>

    <SectionHeading title="Expiring Soon" to="/expiring" prominent/>
    <div className="home-list-card expiring-home-card">
      {foods.slice(0,2).map((f,i)=><HomeFoodRow key={f.id} food={f} quantity={getFoodQty(f)} danger priority={i===0?'high':'medium'}/>) }
    </div>

    <SectionHeading title="Recent Items" to="/inventory"/>
    <div className="home-list-card">
      {foods.slice(0,2).map(f=><HomeFoodRow key={f.id} food={f} quantity={getFoodQty(f)}/>) }
    </div>
  </Screen>;
}

function SectionHeading({title,to,prominent=false}){
  return <div className={`section-heading ${prominent?'prominent':''}`}><h2>{title}</h2><Link to={to}>See All</Link></div>;
}

function HomeFoodRow({food,quantity,danger=false,priority=''}){
  return <Link to={`/food/${food.id}`} className="home-food-row">
    <img src={food.image} alt={food.name}/>
    <div className="home-food-copy">
      <div className="home-food-main"><strong>{food.name}</strong><span>{quantity}</span></div>
      <div className={danger?`food-danger ${priority}`:'food-meta'}>{danger && <span className="priority-dot"/>}{danger?food.status:food.meta}</div>
    </div>
  </Link>;
}

function Inventory({foods,setFoods}){
  const [q,setQ]=useState('');
  const [selectionMode,setSelectionMode]=useState(false);
  const [selectedIds,setSelectedIds]=useState([]);
  const [showDeleteConfirmation,setShowDeleteConfirmation]=useState(false);
  const filtered=useMemo(()=>foods.filter(f=>f.name.toLowerCase().includes(q.toLowerCase())),[foods,q]);
  const selectedFoods=foods.filter(f=>selectedIds.includes(f.id));
  function exitSelectionMode(){
    setSelectionMode(false);
    setSelectedIds([]);
    setShowDeleteConfirmation(false);
  }
  function toggleFood(id){
    setSelectedIds(ids=>ids.includes(id)?ids.filter(x=>x!==id):[...ids,id]);
  }
  function confirmDelete(){
    if(!selectedIds.length) return;
    setFoods(fs=>fs.filter(f=>!selectedIds.includes(f.id)));
    exitSelectionMode();
    alert('Delete successfully');
  }
  return <Screen active="inventory" className="inventory-screen" title="Food Inventory">
    <button type="button" className="inventory-trash-toggle" onClick={()=>selectionMode?exitSelectionMode():setSelectionMode(true)} aria-label={selectionMode?'Cancel selecting food items':'Select food items to delete'} title={selectionMode?'Cancel':'Select items to delete'}>
      {selectionMode ? <span>Cancel</span> : <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 10v7M14 10v7"/></svg>}
    </button>
    <div className="search-box"><span>⌕</span><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search food..."/></div>
    <div className="inventory-card">
      {filtered.map(f=><InventoryRow key={f.id} food={f} selectionMode={selectionMode} selected={selectedIds.includes(f.id)} onToggle={()=>toggleFood(f.id)}/>) }
    </div>
    {selectionMode && <div className="inventory-bulk-actions">
      <span>{selectedIds.length} selected</span>
      <button type="button" className="inventory-bulk-delete" disabled={selectedIds.length===0} onClick={()=>setShowDeleteConfirmation(true)}>Delete Selected ({selectedIds.length})</button>
    </div>}
    {showDeleteConfirmation && <div className="modal-overlay delete-overlay" onMouseDown={()=>setShowDeleteConfirmation(false)}>
      <div className="delete-confirm" onMouseDown={e=>e.stopPropagation()}>
        <h2>{selectedFoods.length===1?`Delete ${selectedFoods[0].name}?`:`Delete ${selectedFoods.length} items?`}</h2>
        <p>{selectedFoods.length===1?'Are you sure you want to remove this food item from your inventory?':'Are you sure you want to remove these food items from your inventory?'}</p>
        <div className="modal-actions"><button className="cancel-btn" onClick={()=>setShowDeleteConfirmation(false)}>Cancel</button><button className="confirm-delete-btn" onClick={confirmDelete}>Delete</button></div>
      </div>
    </div>}
  </Screen>;
}

function InventoryRow({food,selectionMode=false,selected=false,onToggle}){
  if(selectionMode) return <label className="inventory-row inventory-select-row">
    <input type="checkbox" className="inventory-select-checkbox" checked={selected} onChange={onToggle} aria-label={`Select ${food.name}`}/>
    <img src={food.image} alt={food.name}/>
    <div><strong>{food.name}</strong><span>{getFoodQty(food)}</span><small>{food.meta}</small></div>
  </label>;
  return <Link to={`/food/${food.id}`} className="inventory-row">
    <img src={food.image} alt={food.name}/>
    <div><strong>{food.name}</strong><span>{getFoodQty(food)}</span><small>{food.meta}</small></div>
  </Link>;
}

function FoodDetail({foods,setFoods}){
  const {id}=useParams(); const nav=useNavigate(); const [confirmDelete,setConfirmDelete]=useState(false);
  const food=foods.find(f=>String(f.id)===String(id)) || foods.find(f=>f.name==='Apple') || seedFoods[2];
  const isSavedFood = Boolean(food.purchaseDate || food.reminderDate || food.storageLocation || food.noPrintedExpiry);
  const detail = isSavedFood ? {
    quantity:getFoodQty(food),
    category:food.category || 'Other',
    storage:food.storageLocation || 'Refrigerator',
    purchase:formatInputDate(food.purchaseDate) || '-',
    expiry:food.noPrintedExpiry ? 'No printed expiry\ndate' : (formatInputDate(food.expiryDate) || '-'),
    period:food.noPrintedExpiry ? (food.recommendedPeriod || '4–6 weeks') : '-',
    reminder:food.noPrintedExpiry ? (formatInputDate(food.reminderDate) || '-') : '-'
  } : food.name==='Apple' ? {
    quantity:'5pcs',category:'Fruits',storage:'Refrigerator',purchase:'10 Sep 2026',expiry:'No printed expiry\ndate',period:'4–6 weeks',reminder:'8 Oct 2026'
  } : {quantity:getFoodQty(food),category:food.category,storage:'Refrigerator',purchase:'10 Sep 2026',expiry:'No printed expiry\ndate',period:'4–6 weeks',reminder:'8 Oct 2026'};
  function remove(){setFoods(fs=>fs.filter(x=>x.id!==food.id));alert('Delete successfully');nav('/inventory')}
  return <Screen back className="detail-screen">
    <div className="detail-image-wrap"><img src={food.image} alt={food.name}/></div>
    <h1 className="detail-name">{food.name}</h1>
    <div className="detail-card">
      <DetailRow label="Quantity" value={detail.quantity}/>
      <DetailRow label="Category" value={detail.category}/>
      <DetailRow label={<>Storage<br/>Location</>} value={detail.storage}/>
      <DetailRow label="Purchase Date" value={detail.purchase}/>
      <DetailRow label={<>Expiry / Best<br/>Before Date</>} value={detail.expiry}/>
      <DetailRow label={<>Recommended<br/>Storage Period</>} value={detail.period}/>
      <DetailRow label={<>Suggested<br/>Reminder</>} value={detail.reminder}/>
    </div>
    <Link className="guide-wide" to="/food-storage-guidance">Food Storage Guide</Link>
    <div className="detail-actions"><button className="delete-btn" onClick={()=>setConfirmDelete(true)}>Delete</button><Link className="edit-btn" to="/add-food">Edit</Link></div>
    {confirmDelete && <div className="modal-overlay delete-overlay" onMouseDown={()=>setConfirmDelete(false)}>
      <div className="delete-confirm" onMouseDown={e=>e.stopPropagation()}>
        <h2>Delete {food.name}?</h2>
        <p>Are you sure you want to remove this food item from your inventory?</p>
        <div className="modal-actions"><button className="cancel-btn" onClick={()=>setConfirmDelete(false)}>Cancel</button><button className="confirm-delete-btn" onClick={remove}>Delete</button></div>
      </div>
    </div>}
  </Screen>;
}

function DetailRow({label,value}){
  return <div className="detail-row"><span>{label}</span><strong>{String(value).split('\n').map((x,i)=><React.Fragment key={i}>{x}{i===0&&String(value).includes('\n')?<br/>:null}</React.Fragment>)}</strong></div>;
}

function FormField({label,children}){return <label className="form-field"><span>{label}</span>{children}</label>}

function AddFood({setFoods}){
  const nav=useNavigate();
  const [name,setName]=useState(''); const [qty,setQty]=useState(''); const [category,setCategory]=useState('');
  const [purchase,setPurchase]=useState(''); const [expiry,setExpiry]=useState(''); const [noExpiry,setNoExpiry]=useState(false); const [storage,setStorage]=useState(''); const [preview,setPreview]=useState('');
  const recommendedPeriod='4–6 weeks';
  const reminderDate=noExpiry && purchase ? addDaysToInputDate(purchase,28) : '';
  function submit(e){
    e.preventDefault();
    const id=Date.now();
    if(!name.trim() || !qty.trim()) return;
    const knownImage = seedFoods.find(f=>f.name.toLowerCase()===name.trim().toLowerCase())?.image;
    const image = preview || knownImage || `${IMG}/icons/camera.svg`;
    const newFood = {
      id,
      name:name.trim(),
      qty:qty.trim(),
      image,
      meta:noExpiry
        ? `Reminder: ${formatInputDate(reminderDate)}`
        : (expiry?`Exp: ${formatInputDate(expiry)}`:'Expiry not set'),
      status:'',
      category:category||'Other',
      purchaseDate:purchase,
      expiryDate:noExpiry?'':expiry,
      noPrintedExpiry:noExpiry,
      recommendedPeriod:noExpiry?recommendedPeriod:'',
      reminderDate:noExpiry?reminderDate:'',
      storageLocation:storage||'Refrigerator'
    };
    setFoods(fs=>[...fs,newFood]);
    nav('/food-added', {state:{name:newFood.name}});
  }
  function upload(e){const f=e.target.files?.[0]; if(f) setPreview(URL.createObjectURL(f))}
  return <Screen back title="Add Food" className="add-food-screen">
    <form className="add-food-form" onSubmit={submit}>
      <FormField label="Food Name *"><input value={name} onChange={e=>setName(e.target.value)}/></FormField>
      <FormField label="Quantity *"><input value={qty} onChange={e=>setQty(e.target.value)}/></FormField>
      <FormField label="Category"><select value={category} onChange={e=>setCategory(e.target.value)}><option value=""></option><option>Fruits</option><option>Vegetables</option><option>Dairy</option><option>Meat & Poultry</option><option>Seafood</option></select></FormField>
      <FormField label="Purchase Date"><div className="date-wrap"><input type="date" value={purchase} onChange={e=>setPurchase(e.target.value)}/><AssetIcon name="calendar"/></div></FormField>
      <FormField label="Expiry / Best Before"><div className="date-wrap"><input type="date" value={expiry} onChange={e=>setExpiry(e.target.value)} disabled={noExpiry}/><AssetIcon name="calendar"/></div></FormField>
      <label className="no-expiry"><input type="checkbox" checked={noExpiry} onChange={e=>setNoExpiry(e.target.checked)}/><span>No printed expiry date</span></label>
      <FormField label="Storage Location"><select value={storage} onChange={e=>setStorage(e.target.value)}><option value=""></option><option>Refrigerator</option><option>Freezer</option><option>Pantry</option><option>Room Temperature</option></select></FormField>
      <label className="upload-box"><input type="file" accept="image/*" onChange={upload}/>{preview?<img className="upload-preview" src={preview} alt="Upload preview"/>:<><AssetIcon name="camera"/><span>Click to Upload Image</span></>}</label>
      <Link className="guide-wide" to="/food-storage-guidance">Food Storage Guide</Link>
      <button className="save-btn" type="submit">Save</button>
    </form>
  </Screen>;
}

function FoodAdded(){
  const location=useLocation();
  const addedName=location.state?.name || 'Food';
  return <Screen className="success-screen"><div className="success-center"><img className="success-image" src={`${IMG}/system/success.png`} alt="Success"/><h2>Food Added<br/>Successfully!</h2><p>{addedName} has been added to your inventory</p><Link className="success-primary" to="/inventory">View Inventory</Link><Link className="success-secondary" to="/">Back to Home</Link></div></Screen>;
}

function Shopping({shopping,setShopping}){
  const [open,setOpen]=useState(false); const [name,setName]=useState(''); const [qty,setQty]=useState(''); const [q,setQ]=useState(''); const [image,setImage]=useState('');
  const [menuId,setMenuId]=useState(null); const [deleteItem,setDeleteItem]=useState(null);
  function add(e){e.preventDefault(); if(!name.trim()) return; setShopping(s=>[...s,{id:Date.now(),name:name.trim(),qty:qty||'1 item',image,done:false,addedDate:formatAddedDate()}]); setName('');setQty('');setImage('');setOpen(false)}
  function uploadShoppingImage(e){
    const file=e.target.files?.[0];
    if(!file) return;
    const reader=new FileReader();
    reader.onload=()=>{
      const source=String(reader.result||'');
      const photo=new Image();
      photo.onload=()=>{
        const max=320;
        const scale=Math.min(1,max/Math.max(photo.width,photo.height));
        const canvas=document.createElement('canvas');
        canvas.width=Math.max(1,Math.round(photo.width*scale));
        canvas.height=Math.max(1,Math.round(photo.height*scale));
        const ctx=canvas.getContext('2d');
        ctx.fillStyle='#fff'; ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(photo,0,0,canvas.width,canvas.height);
        setImage(canvas.toDataURL('image/jpeg',0.78));
      };
      photo.src=source;
    };
    reader.readAsDataURL(file);
  }
  function toggle(id){setShopping(s=>s.map(i=>i.id===id?{...i,done:!i.done}:i))}
  function formatShoppingQty(item){
    const raw=String(item.qty??'').trim();
    if(!raw) return '1 item';
    // Keep quantities that already include a unit, while normalising values such as 5kg -> 5 kg.
    if(/[a-zA-Z]/.test(raw)) return raw.replace(/^(\d+(?:\.\d+)?)([a-zA-Z])/, '$1 $2');
    const n=item.name.toLowerCase();
    if(n.includes('milk')) return `${raw} bottle${raw==='1'?'':'s'}`;
    if(n.includes('egg')) return `${raw} pcs`;
    if(n.includes('bread')) return `${raw} loaf${raw==='1'?'':'s'}`;
    if(n.includes('chicken')) return `${raw} kg`;
    if(n.includes('rice')) return `${raw} kg`;
    if(n.includes('banana')) return `${raw} bunch${raw==='1'?'':'es'}`;
    if(n.includes('apple')) return `${raw} kg`;
    return `${raw} item${raw==='1'?'':'s'}`;
  }
  function requestDelete(item){setMenuId(null);setDeleteItem(item)}
  function confirmShoppingDelete(){
    if(!deleteItem) return;
    setShopping(s=>s.filter(i=>i.id!==deleteItem.id));
    setDeleteItem(null);
    alert('Delete successfully');
  }
  const filtered=shopping.filter(item=>item.name.toLowerCase().includes(q.toLowerCase()));
  const shoppingImage=(item)=>{
    if(item.image) return item.image;
    const n=item.name.toLowerCase();
    if(n.includes('milk')) return `${IMG}/food/milk.png`;
    if(n.includes('chicken breast')) return `${IMG}/shopping/chicken-breast.png`;
    if(n.includes('chicken')) return `${IMG}/food/chicken.png`;
    if(n.includes('banana')) return `${IMG}/categories/fruits.png`;
    if(n.includes('bread')) return `${IMG}/shopping/bread.png`;
    if(n.includes('rice')) return `${IMG}/shopping/rice.png`;
    if(n.includes('egg')) return `${IMG}/shopping/egg.png`;
    return `${IMG}/actions/food-guidance.png`;
  };
  return <Screen active="shopping" title="Shopping List" className="shopping-screen">
    <div className="shopping-search"><span>⌕</span><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search shopping items..."/></div>
    <div className="shopping-list-card">
      {filtered.map(item=><div className={`shopping-list-row ${item.done?'done':''}`} key={item.id}>
        <input type="checkbox" checked={item.done} onChange={()=>toggle(item.id)}/>
        <img className="shopping-thumb" src={shoppingImage(item)} alt=""/>
        <div className="shopping-item-copy"><strong>{item.name}</strong><span>Quantity: {formatShoppingQty(item)}</span><span>Added: {item.addedDate}</span></div>
        <div className="shopping-more-wrap">
          <button className="shopping-more-btn" aria-label={`More options for ${item.name}`} onClick={()=>setMenuId(menuId===item.id?null:item.id)}>⋮</button>
          {menuId===item.id && <div className="shopping-more-menu"><button type="button" onClick={()=>requestDelete(item)}>Delete</button></div>}
        </div>
      </div>)}
    </div>
    <button className="shopping-fab" onClick={()=>setOpen(true)} aria-label="Add item">＋</button>
    {open && <div className="modal-overlay" onMouseDown={()=>setOpen(false)}>
      <form className="shopping-modal" onSubmit={add} onMouseDown={e=>e.stopPropagation()}>
        <h2>Add to Shopping List</h2>
        <FormField label="Food Name *"><input autoFocus value={name} onChange={e=>setName(e.target.value)} required/></FormField>
        <FormField label="Quantity & Unit (Optional)"><input value={qty} onChange={e=>setQty(e.target.value)} placeholder="e.g. 1 kg / 2 bottles / 1 bunch"/></FormField>
        <label className="shopping-upload-box">
          <input type="file" accept="image/*" onChange={uploadShoppingImage}/>
          {image ? <img className="shopping-upload-preview" src={image} alt="Shopping item preview"/> : <><AssetIcon name="camera"/><span>Click to Upload Image</span></>}
        </label>
        <div className="modal-actions"><button type="button" className="cancel-btn" onClick={()=>setOpen(false)}>Cancel</button><button type="submit" className="add-item-btn">Add Item</button></div>
      </form>
    </div>}
    {deleteItem && <div className="modal-overlay delete-overlay" onMouseDown={()=>setDeleteItem(null)}>
      <div className="delete-confirm" onMouseDown={e=>e.stopPropagation()}>
        <h2>Delete {deleteItem.name}?</h2>
        <p>Are you sure you want to remove this item from your Shopping List?</p>
        <div className="modal-actions"><button className="cancel-btn" onClick={()=>setDeleteItem(null)}>Cancel</button><button className="confirm-delete-btn" onClick={confirmShoppingDelete}>Delete</button></div>
      </div>
    </div>}
  </Screen>;
}

const guidanceCategories=[
  ['fruits','Fruits','/guidance/fruits'],['vegetables','Vegetables',null],['dairy','Dairy',null],['meat-poultry','Meat & Poultry',null],['seafood','Seafood',null],['leftovers','Leftovers /\nCooked Food',null],['packaged','Packaged\nFood',null]
];

function GuidanceHub(){
  return <Screen back title="Food Guidance" className="guidance-hub-screen">
    <p className="guidance-hub-subtitle">Choose the type of guidance you want to view.</p>
    <div className="guidance-hub-card">
      <Link to="/food-storage-guidance" className="guidance-hub-row">
        <img src={QUICK_IMG.guidance} alt=""/>
        <div><strong>Food Storage Guidance</strong><span>Storage information by food category</span></div><b>&gt;</b>
      </Link>
      <Link to="/expiry-guidance" className="guidance-hub-row">
        <AssetIcon name="info"/>
        <div><strong>Storage &amp; Expiry Guidance</strong><span>Storage, handling and expiry label information</span></div><b>&gt;</b>
      </Link>
    </div>
  </Screen>;
}

function FoodGuidance(){
  return <Screen back title="Food Storage Guidance" className="food-guidance-screen">
    <p className="guidance-subtitle">Learn how to store different types of food<br/>properly to keep them fresh and safe.</p>
    <div className="guidance-category-card">
      {guidanceCategories.map(([img,label,to])=>{
        const content=<><img src={`${IMG}/categories/${img}.png`} alt=""/><span>{label.split('\n').map((x,i)=><React.Fragment key={i}>{x}{i===0&&label.includes('\n')?<br/>:null}</React.Fragment>)}</span><b>&gt;</b></>;
        return to?<Link key={label} className="guidance-category-row" to={to}>{content}</Link>:<div key={label} className="guidance-category-row">{content}</div>;
      })}
    </div>
    <SourceNote>Guidance based on official food-safety information from the Ministry of Health Malaysia and FoodKeeper.</SourceNote>
  </Screen>;
}

function SourceNote({children}){return <div className="source-note"><AssetIcon name="info"/><p>{children}</p></div>}

function FruitsGuidance(){
  return <Screen back title="Fruits Storage Guidance" className="fruits-guidance-screen">
    <p className="fruits-subtitle">Learn how to store fresh fruits properly.</p>
    <FruitGuideCard image="room-temperature" title="Room Temperature" badge="Unripe Fruits">Store unripe fruits, such as bananas, at room temperature until they ripen.</FruitGuideCard>
    <FruitGuideCard image="refrigerator" title="Refrigerator Storage" badge="Fresh Fruits">Store fruits in the lower section of the refrigerator to help prevent freezing damage.</FruitGuideCard>
    <FruitGuideCard image="no-freezer" title="Freezer Reminder" badge="Avoid Freezing Fresh Fruits">Fresh fruits should not normally be stored in the freezer because freezing temperatures may damage the fruit tissue.</FruitGuideCard>
    <SourceNote>Guidance based on official food-safety information from the Ministry of Health Malaysia and FoodKeeper.</SourceNote>
  </Screen>;
}

function FruitGuideCard({image,title,badge,children}){
  return <div className="fruit-guide-card"><img src={`${IMG}/guidance/${image}.png`} alt=""/><div><h3>{title}</h3><span>{badge}</span><p>{children}</p></div></div>;
}

function Expiring({foods}){
  const [priorityFilter,setPriorityFilter]=useState('all');
  const visible=foods.slice(0,2);
  const priorityFor=(food,index)=> index===0 ? {label:'High Priority',key:'high'} : {label:'Medium Priority',key:'medium'};
  const priorityItems=visible.map((food,index)=>({food,priority:priorityFor(food,index)}));
  const countPriority=key=>priorityItems.filter(item=>item.priority.key===key).length;
  const filteredPriorityItems=priorityFilter==='all' ? priorityItems : priorityItems.filter(item=>item.priority.key===priorityFilter);
  return <Screen back title="Expiring Soon" className="expiring-screen">
    <div className="expiry-tabs"><button className="active">Within 3 Days</button><button>Within 7 Days</button></div>
    <div className="priority-count-panel" role="group" aria-label="Filter food by expiry priority">
      {[
        {key:'high',label:'High'},
        {key:'medium',label:'Medium'},
        {key:'low',label:'Low'}
      ].map(({key,label})=><button key={key} type="button" className={`priority-count-card ${key} ${priorityFilter===key?'selected':''}`} aria-label={`${label} priority: ${countPriority(key)} items. ${priorityFilter===key?'Show all items':'Filter items'}`} aria-pressed={priorityFilter===key} onClick={()=>setPriorityFilter(current=>current===key?'all':key)}>
        <span className="priority-count-heading"><span className="priority-count-dot"/>{label}</span>
        <strong className="priority-count-number">{countPriority(key)}</strong>
      </button>)}
    </div>
    <div className="expiry-list-card">{filteredPriorityItems.map(({food:f,priority:p})=><Link to={`/food/${f.id}`} className="expiry-row" key={f.id}><img src={f.image} alt={f.name}/><div><em className={`priority-pill ${p.key}`}>{p.label}</em><strong>{f.name}</strong><small style={{fontSize:'17px',color:'#777',fontWeight:700}}>Quantity: {getFoodQty(f)}</small><span className={p.key}>{f.status}</span></div><b>&gt;</b></Link>)}</div>
  </Screen>;
}

function ExpiryGuidance(){
  return <Screen back title="Storage & Expiry Guidance" className="expiry-guidance-screen">
    <ExpiryGuideCard icon="storage" title="Storage Guidance" lines={['Store food at the correct temperature.','Keep raw and cooked food separate.','Use airtight containers.']}/>
    <ExpiryGuideCard icon="handling" title="Handling Guidance" lines={['Wash hands before and after handling food.','Keep food preparation areas clean.','Cook food thoroughly.']}/>
    <ExpiryGuideCard icon="product-label" title="Product Label Reminder" lines={['Check the “Use By” or “Best Before” date.','Follow storage instructions on the label.','Consume food before the expiry date for best quality.']}/>
    <SourceNote>Guidance based on official food-safety information from the Ministry of Health Malaysia and FoodKeeper.</SourceNote>
  </Screen>;
}

function ExpiryGuideCard({icon,title,lines}){
  return <div className="expiry-guide-card"><div className="expiry-guide-title"><img className="expiry-guide-icon" src={`${IMG}/guidance/${icon}.png`} alt=""/><h3>{title}</h3></div><ul>{lines.map(line=><li key={line}>{line}</li>)}</ul></div>;
}

function Profile(){
  const settings=[['help','Notification Settings'],['gear','App Settings'],['info','Help & Support'],['bell','About']];
  return <Screen active="profile" title="Profile" className="profile-screen">
    <div className="profile-header"><img src={`${IMG}/icons/avatar.svg`} alt="Profile"/><div><strong>Nur Aina Rahman</strong><span>nurainarahman@gmail.com</span></div></div>
    <div className="settings-card">{settings.map(([icon,label])=><button key={label}><AssetIcon name={icon}/><strong>{label}</strong><span>&gt;</span></button>)}</div>
    <button className="logout-btn">Logout</button>
  </Screen>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<HashRouter><App/></HashRouter>);
