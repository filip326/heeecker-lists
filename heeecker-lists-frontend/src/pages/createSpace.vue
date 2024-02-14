<script lang="ts">
import { format } from "date-fns/format";
import { add } from "date-fns/add";

type CreateSpacePayload = {
  name: string;
  description: string;
  createdBy: string;
  ownerContactMail: string;
  deletionDate?: number;
};

export default {
  data() {
    return {
      name: "",
      description: "",
      customDeletionDate: false,
      deletionDate: add(Date.now(), { days: 30 }),
      createdBy: "",
      contactMail: "",
      rules: {
        required: (v: string) => !!v || "This field is required",
        mail: (v: string) => /.+@.+\..+/.test(v) || "E-mail must be valid",
      },
      button: {
        isLoading: false,
      },
      error: {
        isError: false,
        description: "",
      },
      done: {
        isDone: false,
        shareableCode: "hi",
        adminCode: "nein",
      },
    };
  },
  methods: {
    async submitForm() {
      const payload: CreateSpacePayload = {
        name: this.name,
        description: this.description,
        createdBy: this.createdBy,
        ownerContactMail: this.contactMail,
      };
      if (this.customDeletionDate) {
        payload.deletionDate = this.deletionDate.getTime();
      }

      const response = await fetch("/api/spaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }).catch(() => {
        this.error.isError = true;
        this.error.description = "Please try again later.";
      });
      if (!response) {
        this.error.isError = true;
        this.error.description = "Please try again later.";
        return;
      }
      if (response.status !== 200 && response.status !== 201) {
        this.error.isError = true;
        this.error.description = `Please try again later. Http Status: ${response.status}`;
        return;
      }
      const data = await response.json();
      this.done.isDone = true;
      this.done.shareableCode = data.spaceSharableUrl;
      this.done.adminCode = data.spaceAdminUrl;
    },
    copy(text: string) {
      navigator.clipboard.writeText(text);
    },
  },
  computed: {
    today() {
      return format(Date.now(), "yyyy-MM-dd");
    },
    in30days() {
      return format(add(Date.now(), { days: 30 }), "yyyy-MM-dd");
    },
    in60days() {
      return format(add(Date.now(), { days: 60 }), "yyyy-MM-dd");
    },
  },
};
</script>
<template>
  <VForm @submit.prevent="submitForm" class="small-padding">
    <h1>Create a Space</h1>
    <VTextField
      v-model="name"
      label="Name"
      placeholder="Be creative"
      required
      :rules="[rules.required]"
    />
    <VTextField
      v-model="description"
      label="Description"
      placeholder="Be even more creative"
      required
      :rules="[rules.required]"
    />
    <VTextField
      v-model="createdBy"
      label="Owner"
      placeholder="Do not be creative - Your Name"
      required
      :rules="[rules.required]"
    />
    <VTextField
      v-model="contactMail"
      label="Contact Mail"
      placeholder="name@company.org"
      hint="Contact Mail will be shown to users to give them the possibility to contact you."
      required
      :rules="[rules.required, rules.mail]"
    />
    <h2>Deletion date</h2>
    <p>
      Your Space will be deleted in 30 days by default. You may extend or
      shortern the lifetime up to 60 days. You will be able to extend the
      lifetime when it is about to expire.<br />
      <strong
        >If you forget to extend the space, the space will be deleted on the
        date set.</strong
      >
      By default, the space will be deleted in 30 days.
    </p>
    <VCheckbox
      v-model="customDeletionDate"
      label="I want to set my own deletion date."
      required
    />
    <template v-if="customDeletionDate">
      <p>
        You may set a deletion date up to 60 days from now. If you don't want to
        set a deletion date and use the default, uncheck the checkbox above.
      </p>
      <VCard>
        <VDatePicker :min="today" :max="in60days" v-model="deletionDate" />
      </VCard>
    </template>

    <VAlert type="info">
      By creating a space you agree to my privacy policy and terms of service. </VAlert
    ><br />
    <VBtn type="submit" color="primary" :loading="button.isLoading"
      >Create Space</VBtn
    >
  </VForm>
  <VDialog v-model="error.isError">
    <VCard>
      <VCardTitle>Error</VCardTitle>
      <VCardSubtitle>
        An error occured while creating the space. Please try again later.
      </VCardSubtitle>
      <VCardText>
        {{ error.description }}
      </VCardText>
      <VCardActions>
        <VBtn @click="error.isError = false">Close</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
  <VDialog v-model="done.isDone">
    <VCard>
      <VCardTitle>Space created</VCardTitle>
      <VCardText>
        Your space has been created. You may now share the following url with
        your friends or colleagues to let them join your space. Please do save
        the admin url, you will need it to manage your space. If you loose it,
        you won't be able to make changes to your space anymore. Do not publish
        or share the admin url, unless you really trust the receiver.
        <VTextField
          v-model="done.shareableCode"
          label="Shareable Code"
          readonly
          append-inner-icon="mdi-content-copy"
          @click:append-inner="copy(done.shareableCode)"
        />
        <VTextField
          v-model="done.adminCode"
          label="Admin Code"
          readonly
          append-inner-icon="mdi-content-copy"
          @click:append-inner="copy(done.adminCode)"
        />
      </VCardText>
      <VCardActions>
        <VBtn @click="done.isDone = false">Close</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.small-padding {
  padding: 0 10px;
}
</style>
