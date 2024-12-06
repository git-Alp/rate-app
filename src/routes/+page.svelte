<script>
  import { db } from '../lib/firebase/firebase';
  import { collection, onSnapshot, getDoc, updateDoc, doc, arrayUnion } from 'firebase/firestore';
  import { onMount } from 'svelte';

  let list = [];
  let ratings = {};
  let rated = new Set();
  let userId = ""

  // Load rated state from localStorage
  onMount(() => {
    const storedRated = JSON.parse(localStorage.getItem("rated")) || [];
    rated = new Set(storedRated);

    if (!localStorage.getItem("userId")) {
      localStorage.setItem("userId", crypto.randomUUID());
    }
    userId = localStorage.getItem("userId");

    // Get and sort list from Firestore for real-time updates
    const getList = onSnapshot(collection(db, "list"), (snapshot) => {
      list = snapshot.docs
        .map((doc) => {
          const id = doc.id;
          return {
            id,
            name: doc.data().name,
            stars: doc.data().stars || [],
            order: doc.data().order || 0,
            isRated: rated.has(id)
          };
        })
        .sort((a, b) => b.order - a.order);
    });

    return getList;
  });

  // Handle star click
  const clickRate = (num, id) => {
    if (rated.has(id)) return;
    ratings[id] = num;
  };

  const updateItem = async (id) => {
    if (rated.has(id)) return;

    const starsToAdd = ratings[id];
    if (!starsToAdd) return;

    rated.add(id);
    localStorage.setItem("rated", JSON.stringify([...rated]));
    delete ratings[id];
    list = list.map((item) => 
      item.id === id 
        ? { ...item, isRated: true } 
        : item
    );

    try {
      const docRef = doc(db, "list", id);
      const newRating = { userId, rating: starsToAdd };
      await updateDoc(docRef, {
        stars: arrayUnion(newRating),
      });
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };
</script>

<div class="h-screen w-screen flex flex-col items-center bg-cover bg-no-repeat" style="background-image: url(/cristmas-bg-mobile-3.jpg)">
  <h1 class="text-title text-4xl font-bold mt-12 mb-4">Katılımcılar</h1>

  <div class="w-full flex flex-col my-4 max-h-[50vh] overflow-y-auto">
    {#if list.length === 0}
      <h2 class="text-title text-xl font-semibold">Katılımcılar Bekleniyor..</h2>
    {/if}
    
    {#each list as item, index}
      <div class="flex flex-col items-center w-full gap-2 py-2 px-4 border-b-[1px] border-title last:border-0" id="{item.id}">
        <div class="flex items-center">
          <p class="text-text text-xl font-medium">{item.name}</p>
        </div>
        {#if !item.isRated}
          <div class="flex gap-1">
            {#each Array(10) as _, starIndex}
              <button on:click={() => clickRate(starIndex + 1, item.id)}>
                <img src={ratings[item.id] > starIndex ? "/gold-star.png" : "/white-star.png"} class="w-8" alt="star"/>
              </button>
            {/each}
          </div>
          <button class="w-40 h-8 bg-button text-white font-normal text-lg rounded-lg disabled:opacity-75" on:click={() => updateItem(item.id)} disabled={!ratings[item.id]}>
            Puanla
          </button>
        {:else}
          <span class="text-text-2 text-lg font-medium">Puan Verildi</span>
        {/if}
      </div>
    {/each}
  </div>
</div>
