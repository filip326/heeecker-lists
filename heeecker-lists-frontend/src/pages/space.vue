<script lang="ts">
import { format } from "date-fns/format";
export default {
  data() {
    return {
      spaceId: this.$route.query.spaceId || null,
      token: this.$route.query.token || null,
      spaceData: {
        name: "Space-Name",
        description:
          "Space Beschreibung Space Beschreibung Space Beschreibung Space Beschreibung Space Beschreibung Space Beschreibung Space Beschreibung",
        createdBy: "Erstellt von",
        ownerContactMail: "",
        deletionDate: 0,
        createdAt: 0,
        modifiedAt: 0,
        admin: {
          isAdmin: false,
          adminUrl: "",
          shareableUrl: "",
        },
      },
    };
  },
  mounted() {
    if (!this.spaceId || !this.token) {
      this.$router.push("/");
    }
  },
  computed: {
    deletionDateFormatted() {
      return format(this.spaceData.deletionDate, "yyyy-MM-dd");
    },
    modifiedDateFormatted() {
      return format(this.spaceData.modifiedAt, "yyyy-MM-dd");
    },
    createdDateFormatted() {
      return format(this.spaceData.createdAt, "yyyy-MM-dd");
    },
  },
};
</script>

<template>
  <div class="wrapper">
    <small>
      <p>
        Id: {{ spaceId }} <br />
        Token: {{ token }}
      </p>
    </small>

    <h1>{{ spaceData.name }}</h1>
    <p>
      {{ spaceData.description }}
    </p>
    <div class="metadata">
      <span><VIcon>mdi-account</VIcon> {{ spaceData.createdBy }}</span>
      <span><VIcon>mdi-plus</VIcon> {{ createdDateFormatted }}</span>
      <span><VIcon>mdi-update</VIcon> {{ modifiedDateFormatted }}</span>
      <span><VIcon>mdi-trash-can</VIcon> {{ deletionDateFormatted }}</span>
    </div>
  </div>
</template>

<style scoped>

.wrapper {
    padding: 0 10px;
}
.metadata {
  display: flex;
  margin-top: 1rem;
  color: #666;
  font-size: 0.8rem;
  gap: 7px;
}

.metadata > span {
  display: flex;
  align-items: center;
  width: fit-content;
  gap: 0px;
  padding: 3px;
  border: 1px solid #666;
  border-radius: 20px;
}
</style>
