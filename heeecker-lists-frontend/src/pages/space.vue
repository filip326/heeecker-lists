<script lang="ts">
export default {
    data() {
        return {
            spaceId: this.$route.query.spaceId || null,
            token: this.$route.query.token || null,
        }
    },
    mounted() {
        if (!this.spaceId || !this.token) {
            this.$router.push("/");
        }
    }
}
</script>

<template>
    <small>
        <p>Id: {{ spaceId }} <br/> Token: {{ token }}</p>
    </small>

</template>