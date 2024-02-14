<script lang="ts">
import { format } from "date-fns/format";

type List =
  | {
      state: "pre-loaded";
      id: string;
      name: string;
    }
  | {
      state: "fully-loaded";
      id: string;
      name: string;
      description?: string;
      columns: ListColumn[];
      maxRows?: number;
      rows: (any & { _timestamp: number })[];
    };

type ListColumn = {
  name: string;
  required: boolean;
  description?: string;
  unique: boolean;
  regexTest?: string;
};

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
          isAdmin: true,
          adminUrl: "",
          shareableUrl: "",
        },
      },

      lists: [
        { state: "pre-loaded", id: "1", name: "List 1" },
        { state: "pre-loaded", id: "2", name: "List 2" },
        {
          state: "fully-loaded",
          name: "Hallo Welt",
          id: "3",
          description: "Eine Liste mit Hallo Welt",
          columns: [
            { name: "Spalte 1", required: true },
            { name: "Spalte 2", required: false },
            { name: "Spalte 3", required: true },
            { name: "Spalte 4"}
          ],
          maxRows: 10,
          rows: [
            {
              "Spalte 1": "Hallo",
              "Spalte 2": "Welt",
              "Spalte 3": "!",
              "Spalte 4": "Ja!",
            },
            { "Spalte 1": "Hallo", "Spalte 2": "Welt", "Spalte 3": "!" },
            { "Spalte 1": "Hallo", "Spalte 2": "Welt", "Spalte 3": "!" },
            { "Spalte 1": "Hallo", "Spalte 2": "Welt", "Spalte 3": "!" },
            { "Spalte 1": "Hallo", "Spalte 2": "Welt", "Spalte 3": "!" },
            { "Spalte 1": "Hallo", "Spalte 2": "Welt", "Spalte 3": "!" },
            { "Spalte 1": "Hallo", "Spalte 2": "Welt", "Spalte 3": "!" },
            {
              "Spalte 1": "Hallo",
              "Spalte 2": "Welt",
              "Spalte 3": "!",
              "Spalte 4": "Ja!",
            },
            {
              "Spalte 1": "Hallo",
              "Spalte 2": "Welt",
              "Spalte 3": "!",
              "Spalte 4": "Nein",
            },
            {
              "Spalte 1": "Hallo",
              "Spalte 2": "Welt",
              "Spalte 3": "!",
              "Spalte 4": "Nein",
            },
          ],
        },
      ] as List[],

      rules: {
        required: (v) => !!v || "This field is required",
      },

      listAddForm: {
        name: "",
        description: "",
        columns: [] as ListColumn[],
        columnEditor: {
          open: false,
          target: -1,
          name: "",
          required: false,
          description: "",
          unique: false,
          regexTest: "",
        },
        maxRowCount: null,
      },
    };
  },
  methods: {
    openAddColumnDialog(index?: number) {
      this.listAddForm.columnEditor.target = -1;
      this.listAddForm.columnEditor.open = true;
      this.listAddForm.columnEditor.name = "";
      this.listAddForm.columnEditor.required = false;
      this.listAddForm.columnEditor.description = "";
      this.listAddForm.columnEditor.unique = false;
      this.listAddForm.columnEditor.regexTest = "";
      if (index !== undefined && index !== -1) {
        if (index >= this.listAddForm.columns.length) return;
        this.listAddForm.columnEditor.target = index;
        this.listAddForm.columnEditor.name =
          this.listAddForm.columns[index].name;
        this.listAddForm.columnEditor.required =
          this.listAddForm.columns[index].required;
        this.listAddForm.columnEditor.description =
          this.listAddForm.columns[index].description ?? "";
        this.listAddForm.columnEditor.unique =
          this.listAddForm.columns[index].unique;
        this.listAddForm.columnEditor.regexTest =
          this.listAddForm.columns[index].regexTest ?? "";
      }
    },
    closeAddColumnDialogSave() {
      if (this.listAddForm.columnEditor.target === -1) {
        this.listAddForm.columns.push({
          name: this.listAddForm.columnEditor.name,
          required: this.listAddForm.columnEditor.required,
          description:
            this.listAddForm.columnEditor.description.trim() || undefined,
          unique: this.listAddForm.columnEditor.unique,
          regexTest:
            this.listAddForm.columnEditor.regexTest.trim() || undefined,
        });
      } else {
        this.listAddForm.columns[this.listAddForm.columnEditor.target] = {
          name: this.listAddForm.columnEditor.name,
          required: this.listAddForm.columnEditor.required,
          description:
            this.listAddForm.columnEditor.description.trim() || undefined,
          unique: this.listAddForm.columnEditor.unique,
          regexTest:
            this.listAddForm.columnEditor.regexTest.trim() || undefined,
        };
      }
      this.listAddForm.columnEditor.open = false;
    },
    async fullyLoadList(index: number) {
      // TODO: Fetch list data from server
    },
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

    <VExpansionPanels>
      <VExpansionPanel v-if="spaceData.admin.isAdmin">
        <VExpansionPanelTitle
          ><VIcon>mdi-plus</VIcon>Liste Erstellen</VExpansionPanelTitle
        >
        <VExpansionPanelText>
          <VAlert type="info" border="left">
            Nur Admins können Listen erstellen.
          </VAlert>
          <br />
          <VForm>
            <VTextField
              label="List Name"
              v-model="listAddForm.name"
              required
              :rules="[rules.required]"
            />
            <VTextField
              label="List Description"
              v-model="listAddForm.description"
              required
              :rules="[rules.required]"
            />
            <h3>Columns</h3>
            <VBtn
              @click="openAddColumnDialog(-1)"
              color="primary"
              prepend-icon="mdi-plus"
              >Add Column</VBtn
            >
            <span v-if="listAddForm.columns.length < 1"
              >You need to add at least one column to create a list.</span
            >
            <VTable class="margin-bellow">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Required</th>
                  <th>Description</th>
                  <th>Unique</th>
                  <th>Regex Test</th>
                  <th>Edit</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(column, index) in listAddForm.columns" :key="index">
                  <td>{{ column.name }}</td>
                  <td><VCheckbox v-model="column.required" readonly /></td>
                  <td>{{ column.description }}</td>
                  <td><VCheckbox v-model="column.unique" readonly /></td>
                  <td>{{ column.regexTest }}</td>
                  <td>
                    <VBtn
                      icon="mdi-pencil"
                      color="primary"
                      @click="openAddColumnDialog(index)"
                    />
                    <VBtn
                      icon="mdi-trash-can"
                      color="error"
                      @click="listAddForm.columns.splice(index, 1)"
                    />
                  </td>
                </tr>
              </tbody>
            </VTable>
            If you want to limit the amount of rows in this list, you can set a
            max row count.
            <VTextField
              label="Max Row Count"
              v-model="listAddForm.maxRowCount"
              type="number"
              hint="Leave empty for unlimited rows."
            />
            <VAlert type="warning" class="margin-bellow">
              Please note that you can not change any list properties after
              creating the list, since this is a future feature and not yet
              implemented.
            </VAlert>
            <VBtn
              type="submit"
              color="primary"
              :disabled="listAddForm.columns.length < 1"
              >Create List</VBtn
            >
            <span v-if="listAddForm.columns.length < 1"
              >You need to add at least one column to create a list.</span
            >
          </VForm>
        </VExpansionPanelText>
      </VExpansionPanel>
      <VExpansionPanel v-for="(list, index) in lists" v-bind:key="index">
        <template v-if="list.state === 'pre-loaded'">
          <VExpansionPanelTitle @click="fullyLoadList(index)">
            {{ list.name }}
          </VExpansionPanelTitle>
          <VExpansionPanelText>
            <VProgressCircular indeterminate color="primary" /> Liste wird
            geladen...
          </VExpansionPanelText>
        </template>
        <template v-else-if="list.state === 'fully-loaded'">
          <VExpansionPanelTitle>
            {{ list.name }}
          </VExpansionPanelTitle>
          <VExpansionPanelText>
            <p>{{ list.description }}</p>
            <VDataTable
              :headers="
                list.columns.map((column) => ({
                  title: column.name,
                  value: column.name,
                  key: column.name,
                }))
              "
              :items="list.rows"
            />
          </VExpansionPanelText>
        </template>
      </VExpansionPanel>
    </VExpansionPanels>
  </div>

  <VDialog v-model="listAddForm.columnEditor.open">
    <VCard>
      <VCardTitle>
        {{ listAddForm.columnEditor.target === -1 ? "Add" : "Edit" }} Column
      </VCardTitle>
      <VForm @submit.prevent="closeAddColumnDialogSave">
        <VCardText>
          How do you want to name this column?
          <VTextField
            v-model="listAddForm.columnEditor.name"
            label="Name"
            required
            :rules="[rules.required]"
          />
          Do you want to add a description or hint to this column?
          <VTextField
            v-model="listAddForm.columnEditor.description"
            label="Description"
          />
          Do you want to test the value against a regex?
          <VTextField
            v-model="listAddForm.columnEditor.regexTest"
            label="Regex Test"
          />
          Is this value required in this column?
          <VCheckbox
            v-model="listAddForm.columnEditor.required"
            label="Required"
          />
          Does the value needs to be unique in this column?
          <VCheckbox v-model="listAddForm.columnEditor.unique" label="Unique" />
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn type="submit" color="primary" variant="flat">Save</VBtn>
          <VBtn
            type="button"
            @click="listAddForm.columnEditor.open = false"
            variant="text"
            >Cancel</VBtn
          >
          <VSpacer />
        </VCardActions>
      </VForm>
    </VCard>
  </VDialog>
</template>

<style scoped>
.wrapper {
  padding: 0 10px;
}
.metadata {
  display: flex;
  margin-top: 1rem;
  color: #ccc;
  font-size: 0.8rem;
  gap: 7px;

  margin-bottom: 15px;
}

.margin-bellow {
  margin-bottom: 15px;
}

.metadata > span {
  display: flex;
  align-items: center;
  width: fit-content;
  gap: 0px;
  padding: 3px;
  border: 1px solid #ccc;
  border-radius: 20px;
}
</style>
