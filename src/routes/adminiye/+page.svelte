<script>
  import { db } from '../../lib/firebase/firebase';
  import { collection, addDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
  import { onMount } from 'svelte';

  let list = [];
  let newItem = "";

  // Fetch items from Firestore on component mount
  onMount(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "list"));
      // list = querySnapshot.docs.map(doc => ({
      //   id: doc.id,
      //   name: doc.data().name,
      //   stars: doc.data().stars | []
      // }));
      list = querySnapshot.docs
        .map((doc) => ({
            id: doc.id,
            name: doc.data().name,
            stars: doc.data().stars || [],
            order: doc.data().order || 0,
            deleteItem: false
        }))
        .sort((a, b) => b.order - a.order);
    } catch (error) {
      console.error("Error fetching list:", error);
    }
  });

  // Add a new item to Firestore
  const addItem = async (e) => {
    e.preventDefault();

    if (!newItem.trim()) {
      alert("Please enter a valid name.");
      return;
    }
    if (list.some(item => item.name.toLowerCase() === newItem.toLowerCase())) {
      alert("This name already exists in the list.");
      return;
    }

    try {
      const timestamp = Date.now();
      const docRef = await addDoc(collection(db, "list"), { 
        name: newItem, 
        stars: [], 
        order: timestamp // Add the order field 
      });

      list = [...list, { id: docRef.id, name: newItem, stars: [], order: timestamp }];
      newItem = "";
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  // Remove an item from Firestore
  const removeItem = async (id) => {
    try {
      await deleteDoc(doc(db, "list", id));
      list = list.filter(item => item.id !== id);
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };
</script>

<div class="h-screen w-screen flex flex-col items-center p-5 bg-cover bg-no-repeat" style="background-image: url(/cristmas-bg-mobile-2.avif)">
  <h1 class="text-title text-4xl font-bold mt-16 mb-4">Admin Page</h1>

  <div class="w-full max-w-sm my-4">
    <h2 class="text-title text-lg font-semibold">Yeni İsim Ekle:</h2>
    <div class="flex w-full gap-4">
      <label class="w-full">
        <input class="w-full h-10 py-2 px-4 bg-white text-dark border-2 border-button rounded-lg" type="text" placeholder="isim" bind:value={newItem} />
      </label>
      <button class="w-40 h-10 bg-button text-white py-1 font-normal text-lg rounded-lg" on:click={addItem}>Ekle</button>
    </div>
  </div>
    
  <div class="w-full max-w-sm flex flex-col my-4 pr-2 gap-4 max-h-[60vh] overflow-y-auto">
    {#if list.length === 0}
      <h2 class="text-title text-xl font-semibold">Liste Boş!</h2>
    {:else}
      <h2 class="text-title text-xl font-semibold">Katılımcılar:</h2>
    {/if}
    
    {#each list as item, index}
      <div class="flex items-center" id="{item.id}">
        <span class="text-text text-lg font-medium">{index + 1}.</span> 
        <p class="text-text-2 text-lg ml-2">{item.name}</p>
        {#if !item.deleteItem}
          <button class="ml-auto" on:click={() => item.deleteItem = true} aria-label="Remove {item.name}">
            <img src="/delete-icon.png" class="w-6" alt="delete-icon"/>
          </button>
        {:else}
          <div class="ml-auto">          
            <button class="text-button text-lg font-medium mr-4" on:click={() => removeItem(item.id)}>Sil</button>
            <button class="text-text-2 text-lg font-medium" on:click={() => item.deleteItem = false}>Vazgeç</button>
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
