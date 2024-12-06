<script>
  import { onMount } from "svelte";
  import { collection, onSnapshot } from "firebase/firestore";
  import { db } from "../../lib/firebase/firebase";

  let list = [];

  // Fetch items from Firestore on component mount
  onMount(() => {
    const getList = onSnapshot(collection(db, "list"), (snapshot) => {
      const fetchedList = snapshot.docs.map((doc) => {
        const data = doc.data();
        const stars = data.stars || [];

        const totalScore = stars.reduce((sum, entry) => sum + entry.rating, 0);
        const averageScore = stars.length > 0 ? totalScore / stars.length : 0;

        return {
          id: doc.id,
          name: data.name,
          averageScore,
          starsCount: stars.length,
        };
      });

      list = fetchedList.sort((a, b) => b.averageScore - a.averageScore);
    });

    return () => getList();
  });
</script>

<div class="h-screen w-screen flex flex-col items-center p-5 bg-cover bg-no-repeat" style="background-image: url(/confetti-bg.gif)">
  <h1 class="text-title text-4xl font-bold my-12">Sonuçlar</h1>

  <div class="result-list max-w-96 w-full max-h-[70vh] overflow-y-auto">
    {#if list.length === 0}
      <p class="text-text text-xl font-medium text-center">Henüz sonuç yok.</p>
    {:else}
      <div class="flex items-center justify-between p-2">
        <span class="text-title text-xl font-semibold">İsim</span>
        <span class="text-title text-xl font-semibold text-center">Ortalama <br> Puan</span>
      </div>
      {#each list as person}
        <div class="flex items-center justify-between p-2">
          <span class="text-text text-xl font-medium">{person.name}</span>
          <span class="text-button text-xl font-medium mr-4">{person.averageScore.toFixed(2)}</span>
          <!-- <span class="text-button text-xl font-medium">Ortalama Puan: {person.averageScore.toFixed(2)} ({person.starsCount} oy)</span> -->
        </div>
      {/each}
    {/if}
  </div>
</div>
