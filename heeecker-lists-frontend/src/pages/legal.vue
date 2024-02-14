<script lang="ts">
export default {
  data() {
    return {
      legalText: `Loading legal text... Please wait.`,
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
        <p>{{ legalText }}</p>
    </div>
</template>