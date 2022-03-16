<template>
  <div>
    <v-container>
      <template>
        <v-data-table
          :headers="headers"
          :items="cinemas"
          sort-by="name"
          class="elevation-1"
          disable-pagination
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>Cinemas</v-toolbar-title>
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
                            <v-text-field v-model="editedItem.name" label="Cinema name" :rules="nameRules" />
                          </v-col>
                          <v-col cols="12" sm="12" md="6">
                            <v-select :items="cities" item-text="fullname" item-value="id" label="City" :rules="cityRules" v-model="editedItem.city.id"></v-select>
                          </v-col>
                          <v-col cols="12" sm="12" md="6">
                            <v-text-field v-model="editedItem.address" label="Cinema address" :rules="addressRules" />
                          </v-col>
                          <v-col cols="12" sm="12" md="6">
                            <v-file-input show-size truncate-length="30" accept="image/*" label="Cinema Image" prepend-icon="mdi-camera" :rules="imageRules" />
                          </v-col>
                          <v-col cols="12" sm="12" md="6">
                            <v-switch v-model="editedItem.enabled" label="Enabled" />
                          </v-col>
                          <v-col cols="12" sm="12" md="6">
                            <v-text-field v-model="editedItem.image" label="Image" disabled />
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
            <v-icon small class="mr-2" @click="editItem(item)">mdi-pencil</v-icon>
            <v-icon small @click="deleteItem(item)">mdi-delete</v-icon>
          </template>

          <template v-slot:[`item.enabled`]="{ item }">
            <v-simple-checkbox v-model="item.enabled" disabled />
          </template>

          <template v-slot:[`item.image`]="{ item }">
            <v-img :src="item.fullimage" :alt="item.image" max-height="64" max-width="48" />
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
        cityRules: [
          v => !!v || 'City is required',
        ],
        nameRules: [
          v => !!v || 'Cinema name is required',
          v => v.length > 4 || 'Cinema name length must be more  than 4 characters',
        ],
        addressRules: [
          v => !!v || 'Cinema address is required',
          v => v.length > 5 || 'Cinema address length must be more  than 5 characters',
        ],
        imageRules: [
          v => !v || v.size < 2000000 || 'Image size should be less than 2 MB!',
        ],
        valid: false,
        headers: [
          {
            text: 'Cinema Name',
            align: 'start',
            sortable: true,
            value: 'name',
          },
          { text: 'Address', value: 'address' },
          { text: 'City', value: 'city.name', sortable: true, },
          { text: 'State', value: 'city.state.codState', sortable: true, },
          { text: 'Enabled', value: 'enabled', sortable: true, },
          { text: 'Image', value: 'image', sortable: true, },
          { text: 'Actions', value: 'actions', sortable: false },
        ],
        cities: [],
        cinemas: [],
        dialog: false,
        dialogDelete: false,
        editedIndex: -1,
        editedItem: {
          id: 0,
          name: '',
          address: '',
          image: '',
          fullimage: '',
          enabled: true,
          city: {
              id: 0,
              name: '',
              fullname: '',
              state: {
                  id: 0,
                  name: '',
                  codState: '',
              }, 
          },
        },
        defaultItem: {
          id: 0,
          name: '',
          address: '',
          image: '',
          fullimage: '',
          enabled: true,
          city: {
              id: 0,
              name: '',
              fullname: '',
              state: {
                  id: 0,
                  name: '',
                  codState: '',
              }, 
          },
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
        getAll('City')
        .then((res) => {
            this.cities = res.data;
            this.cities.forEach(function(city) {
                city.fullname = city.name + ' - ' + city.state.codState;
            });
        })
        .catch((error) => {
          console.log(error);
            this.$swal.fire({ title: 'Error', text: 'Error getting cities list', icon: 'error'});
        });
        getAll('Cinema')
        .then((res) => {
            this.cinemas = res.data;
            this.cinemas.forEach(function(cinema) {
                cinema.city.fullname = cinema.city.name + ' - ' + cinema.city.state.codState;
                cinema.fullimage = process.env.VUE_APP_ASSETS_URL + cinema.image;
            });
        })
        .catch((error) => {
          console.log(error);
            this.$swal.fire({ title: 'Error', text: 'Error getting cinemas list', icon: 'error'});
        });
      },
      editItem (item) {
        this.editedIndex = this.cinemas.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },

      deleteItem (item) {
        this.editedIndex = this.cinemas.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialogDelete = true
      },

      deleteItemConfirm () {
        delEntity('Cinema', this.editedItem)
        .then(() => {
            this.initialize();
            this.$swal.fire({ title: 'Success', text: 'Cinema deleted', icon: 'success'});
        })
        .catch((error) => {
          console.log(error);
          this.$swal.fire({ title: 'Error', text: 'Error deleting cinema', icon: 'error'});
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
          updEntity('Cinema', this.editedItem)
          .then(() => {
            this.initialize();
            this.$swal.fire({ title: 'Success', text: 'Cinema updated', icon: 'success'});
          })
          .catch((error) => {
            console.log(error);
            this.$swal.fire({ title: 'Error', text: 'Error updating cinema', icon: 'error'});
          });
        } else { // Add
          addEntity('Cinema', this.editedItem)
          .then(() => {
            this.initialize();
            this.$swal.fire({ title: 'Success', text: 'Cinema added', icon: 'success'});
          })
          .catch((error) => {
            console.log(error);
            this.$swal.fire({ title: 'Error', text: 'Error adding cinema', icon: 'error'});
          });
        }
        this.close()
      },
    },
  }
</script>
