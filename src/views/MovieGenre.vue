<template>
  <div>
    <v-container>
      <template>
        <v-data-table
          :headers="headers"
          :items="moviegenres"
          sort-by="name"
          class="elevation-1"
          disable-pagination
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>Movie Genres</v-toolbar-title>
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
                            <v-text-field v-model="editedItem.name" label="Movie Genre name" :rules="nameRules" />
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
        nameRules: [
          v => !!v || 'Movie Genre name is required',
          v => v.length > 3 || 'Movie Genre name length must be more than 3 characters',
        ],
        valid: false,
        headers: [
          {
            text: 'Movie Genre Name',
            align: 'start',
            sortable: true,
            value: 'name',
          },
          { text: 'Actions', value: 'actions', sortable: false },
        ],
        moviegenres: [],
        dialog: false,
        dialogDelete: false,
        editedIndex: -1,
        editedItem: {
          id: 0,
          name: '',
        },
        defaultItem: {
          id: 0,
          name: '',
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
        getAll('MovieGenre')
        .then((res) => {
          this.moviegenres = res.data;
        })
        .catch((error) => {
          console.log(error);
            this.$swal.fire({ title: 'Error', text: 'Error getting movie genres list', icon: 'error'});
        });
      },
      editItem (item) {
        this.editedIndex = this.moviegenres.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },

      deleteItem (item) {
        this.editedIndex = this.moviegenres.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialogDelete = true
      },

      deleteItemConfirm () {
        delEntity('MovieGenre', this.editedItem)
        .then(() => {
            this.initialize();
            this.$swal.fire({ title: 'Success', text: 'Movie Genre deleted', icon: 'success'});
        })
        .catch((error) => {
          console.log(error);
          this.$swal.fire({ title: 'Error', text: 'Error deleting movie genre', icon: 'error'});
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
          updEntity('MovieGenre', this.editedItem)
          .then(() => {
            this.initialize();
            this.$swal.fire({ title: 'Success', text: 'Movie Genre updated', icon: 'success'});
          })
          .catch((error) => {
            console.log(error);
            this.$swal.fire({ title: 'Error', text: 'Error updating movie genre', icon: 'error'});
          });
        } else { // Add
          addEntity('MovieGenre', this.editedItem)
          .then(() => {
            this.initialize();
            this.$swal.fire({ title: 'Success', text: 'Movie Genre added', icon: 'success'});
          })
          .catch((error) => {
            console.log(error);
            this.$swal.fire({ title: 'Error', text: 'Error adding movie genre', icon: 'error'});
          });
        }
        this.close()
      },
    },
  }
</script>