<template>
  <div>
    <v-container>
      <template>
        <v-data-table
          :headers="headers"
          :items="states"
          sort-by="codState"
          class="elevation-1"
          disable-pagination
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>States</v-toolbar-title>
              <v-divider class="mx-4" inset vertical></v-divider>
              <v-spacer></v-spacer>
              
              <v-dialog v-model="dialog" max-width="500px">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">New Item</v-btn>
                </template>
                <v-card>
                  <v-card-title>
                    <span class="text-h5">{{ formTitle }}</span>
                  </v-card-title>

                  <v-card-text>
                    <v-form v-model="valid">
                      <v-container>
                        <v-row>
                          <v-col cols="12" sm="12" md="6">
                            <v-text-field v-model="editedItem.name" label="State name" :rules="nameRules" />
                          </v-col>
                          <v-col cols="12" sm="12" md="6">
                            <v-text-field v-model="editedItem.codState" label="State code" :rules="codStateRules" />
                          </v-col>
                        </v-row>
                      </v-container>
                    </v-form>
                  </v-card-text>

                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
                    <v-btn color="blue darken-1" text @click="save" :disabled="!valid">Save</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>

              <v-dialog v-model="dialogDelete" max-width="500px">
                <v-card>
                  <v-card-title class="text-h5">Are you sure you want to delete this item?</v-card-title>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="closeDelete">Cancel</v-btn>
                    <v-btn color="blue darken-1" text @click="deleteItemConfirm">OK</v-btn>
                    <v-spacer></v-spacer>
                  </v-card-actions>
                </v-card>
              </v-dialog>

            </v-toolbar>
          </template>

          <template v-slot:[`item.actions`]="{ item }">
            <v-icon class="mr-2" @click="editItem(item)">mdi-pencil</v-icon>
            <v-icon @click="deleteItem(item)">mdi-delete</v-icon>
          </template>
          <template v-slot:no-data>
            <v-btn
              color="primary"
              @click="initialize"
            >
              Reset
            </v-btn>
          </template>
        </v-data-table>
      </template>
    </v-container>

  </div>

  
</template>

<script>
  import { getAll, addEntity, updEntity, delEntity } from '@/apicalls';

  export default {
    data () {
      return {
        codStateRules: [
          v => !!v || 'State code is required',
          v => v.length === 2 || 'State code length must be 2 characters',
        ],
        nameRules: [
          v => !!v || 'State name is required',
          v => v.length > 3 || 'State name length must be more than 3 characters',
        ],
        valid: false,
        headers: [
          {
            text: 'State Name',
            align: 'start',
            sortable: true,
            value: 'name',
          },
          { text: 'Code', value: 'codState' },
          { text: 'Actions', value: 'actions', sortable: false },
        ],
        states: [],
        dialog: false,
        dialogDelete: false,
        editedIndex: -1,
        editedItem: {
          id: 0,
          name: '',
          codState: '',
        },
        defaultItem: {
          id: 0,
          name: '',
          codState: '',
        },
      }
    },
    computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
      },
    },
    watch: {
      dialog (val) {
        val || this.close()
      },
      dialogDelete (val) {
        val || this.closeDelete()
      },
    },
    created() {
      this.initialize();
    },
    methods: {
      initialize () {
        getAll('State')
        .then((res) => {
          this.states = res.data;
        })
        .catch((error) => {
          console.log(error);
            this.$swal.fire({ title: 'Error', text: 'Error getting states list', icon: 'error'});
        });
      },
      editItem (item) {
        this.editedIndex = this.states.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },

      deleteItem (item) {
        this.editedIndex = this.states.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialogDelete = true
      },

      deleteItemConfirm () {
        delEntity('State', this.editedItem)
        .then(() => {
            this.initialize();
            this.$swal.fire({ title: 'Success', text: 'State deleted', icon: 'success'});
        })
        .catch((error) => {
          console.log(error);
          this.$swal.fire({ title: 'Error', text: 'Error deleting state', icon: 'error'});
        });
        this.closeDelete()
      },

      close () {
        this.dialog = false;
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
      },

      closeDelete () {
        this.dialogDelete = false;
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
      },

      save () {
        if (this.editedIndex > -1) { // Update
          updEntity('State', this.editedItem)
          .then(() => {
            this.initialize();
            this.$swal.fire({ title: 'Success', text: 'State updated', icon: 'success'});
          })
          .catch((error) => {
            console.log(error);
            this.$swal.fire({ title: 'Error', text: 'Error updating state', icon: 'error'});
          });
        } else { // Add
          addEntity('State', this.editedItem)
          .then(() => {
            this.initialize();
            this.$swal.fire({ title: 'Success', text: 'State added', icon: 'success'});
          })
          .catch((error) => {
            console.log(error);
            this.$swal.fire({ title: 'Error', text: 'Error adding state', icon: 'error'});
          });
        }
        this.close()
      },
    },
  }
</script>