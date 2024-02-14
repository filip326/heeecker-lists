<script lang="ts">
export default {
  data() {
    return {
      legalText: `<p>Loading legal text... Please wait.</p>`,
    };
  },
  async beforeCreate() {
    const response = await fetch("/api/legal");
    this.legalText = await response.text();
  }
};
</script>
<template>
    <div>
        <h1>Impressum und Datenschutz</h1>
        <!-- display the legal text as html -->
        <div v-html="legalText"></div>
    </div>
</template>