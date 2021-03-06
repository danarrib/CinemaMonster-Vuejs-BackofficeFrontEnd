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
                  <v-btn
                    color="primary"
                    dark
                    class="mb-2"
                    v-bind="attrs"
                    v-on="on"
                    >New Item</v-btn
                  >
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
                            <v-text-field
                              v-model="editedItem.name"
                              label="Cinema name"
                              :rules="nameRules"
                            />
                          </v-col>
                          <v-col cols="12" sm="12" md="6">
                            <v-select
                              :items="cities"
                              item-text="fullname"
                              item-value="id"
                              label="City"
                              :rules="cityRules"
                              v-model="editedItem.city.id"
                            ></v-select>
                          </v-col>
                          <v-col cols="12" sm="12" md="6">
                            <v-text-field
                              v-model="editedItem.address"
                              label="Cinema address"
                              :rules="addressRules"
                            />
                          </v-col>
                          <v-col cols="12" sm="12" md="6">
                            <v-switch
                              v-model="editedItem.enabled"
                              label="Enabled"
                            />
                          </v-col>
                          <v-col cols="12" sm="12" md="12">
                            <v-file-input
                              ref="fileupload"
                              show-size
                              truncate-length="30"
                              accept="image/*"
                              label="Cinema Image (640 x 480)"
                              @change="selectFile"
                              prepend-icon="mdi-camera"
                            />
                          </v-col>
                          <v-col cols="12" sm="12" md="12">
                            <v-text-field
                              v-model="editedItem.image"
                              label="Image"
                              disabled
                            />
                            <v-btn
                              @click="deleteLocalImage(editedItem)"
                              :disabled="!editedItem.image"
                              >Delete image</v-btn
                            >
                          </v-col>
                        </v-row>
                      </v-container>
                    </v-form>
                  </v-card-text>

                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="close"
                      >Cancel</v-btn
                    >
                    <v-btn
                      color="blue darken-1"
                      text
                      @click="save"
                      :disabled="!valid"
                      >Save</v-btn
                    >
                  </v-card-actions>
                </v-card>
              </v-dialog>

              <v-dialog v-model="dialogDelete" max-width="500px">
                <v-card>
                  <v-card-title class="text-h5"
                    >Are you sure you want to delete this item?</v-card-title
                  >
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="closeDelete"
                      >Cancel</v-btn
                    >
                    <v-btn color="blue darken-1" text @click="deleteItemConfirm"
                      >OK</v-btn
                    >
                    <v-spacer></v-spacer>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-toolbar>
          </template>

          <template v-slot:[`item.actions`]="{ item }">
            <v-icon class="mr-2" @click="auditoriums(item)">mdi-theater</v-icon>
            <v-icon class="mr-2" @click="editItem(item)">mdi-pencil</v-icon>
            <v-icon @click="deleteItem(item)">mdi-delete</v-icon>
          </template>

          <template v-slot:[`item.enabled`]="{ item }">
            <v-simple-checkbox v-model="item.enabled" disabled />
          </template>

          <template v-slot:[`item.image`]="{ item }">
            <v-img
              :src="item.fullimage"
              :alt="item.image"
              max-height="64"
              max-width="48"
            />
          </template>

          <template v-slot:no-data>
            <v-btn color="primary" @click="initialize"> Reset </v-btn>
          </template>
        </v-data-table>
      </template>
    </v-container>
  </div>
</template>

<script>
import {
  getAll,
  addEntity,
  updEntity,
  delEntity,
  uploadAsset,
} from "@/apicalls";

async function deleteImage(item, updateEntity) {
  let filename = item.image.replace("assets/", "");
  let ret = await delEntity("Asset", { filename });
  item.image = '';
  console.log(ret);
  console.log('File deleted: ' + filename);
  
  if(updateEntity) {
    let ret2 = await updEntity("Cinema", item);
    console.log(ret2);
    console.log('Entity updated');
  }
}

async function saveEntity(item, currentFile) {
  // If it's editing, current record already has an image and user are trying to add a new image, then delete current image
  if (item.id > 0 && currentFile && item.image) {
    let filename = item.image.replace("assets/", "");
    let ret = await delEntity("Asset", { filename });
    item.image = '';
    console.log(ret);
    console.log('File deleted: ' + filename);
  }

  // If user is trying to add new image, upload image and update entity image value
  if (currentFile) {
    let ret = await uploadAsset(currentFile);
    console.log(ret);
    console.log('File uploaded: ' + ret.data.filename);
    item.image = 'assets/' + ret.data.filename;
  }

  // Save entity (insert or update)
  if (item.id > 0) {
    let ret = await updEntity("Cinema", item);
    console.log(ret);
    console.log('Entity updated');
  }
  else {
    let ret = await addEntity("Cinema", item);
    console.log(ret);
    console.log('Entity added');
  }
}

export default {
  data() {
    return {
      cityRules: [(v) => !!v || "City is required"],
      nameRules: [
        (v) => !!v || "Cinema name is required",
        (v) =>
          v.length > 4 || "Cinema name length must be more than 4 characters",
      ],
      addressRules: [
        (v) => !!v || "Cinema address is required",
        (v) =>
          v.length > 5 ||
          "Cinema address length must be more  than 5 characters",
      ],
      imageRules: [
        (v) => !v || v.size < 2000000 || "Image size should be less than 2 MB!",
      ],
      valid: false,
      headers: [
        {
          text: "Cinema Name",
          align: "start",
          sortable: true,
          value: "name",
        },
        { text: "Address", value: "address" },
        { text: "City", value: "city.name", sortable: true },
        { text: "State", value: "city.state.codState", sortable: true },
        { text: "Enabled", value: "enabled", sortable: true },
        { text: "Image", value: "image", sortable: false },
        { text: "Actions", value: "actions", sortable: false },
      ],
      cities: [],
      cinemas: [],
      dialog: false,
      currentFile: undefined,
      dialogDelete: false,
      editedIndex: -1,
      editedItem: {
        id: 0,
        name: "",
        address: "",
        image: "",
        fullimage: "",
        enabled: true,
        city: {
          id: 0,
          name: "",
          fullname: "",
          state: {
            id: 0,
            name: "",
            codState: "",
          },
        },
      },
      defaultItem: {
        id: 0,
        name: "",
        address: "",
        image: "",
        fullimage: "",
        enabled: true,
        city: {
          id: 0,
          name: "",
          fullname: "",
          state: {
            id: 0,
            name: "",
            codState: "",
          },
        },
      },
    };
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "New Item" : "Edit Item";
    },
  },
  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
  },
  created() {
    this.initialize();
  },
  methods: {
    initialize() {
      getAll("City")
        .then((res) => {
          this.cities = res.data;
          this.cities.forEach(function (city) {
            city.fullname = city.name + " - " + city.state.codState;
          });
        })
        .catch((error) => {
          console.log(error);
          this.$swal.fire({
            title: "Error",
            text: "Error getting cities list",
            icon: "error",
          });
        });
      getAll("Cinema")
        .then((res) => {
          this.cinemas = res.data;
          this.cinemas.forEach(function (cinema) {
            cinema.city.fullname =
              cinema.city.name + " - " + cinema.city.state.codState;
            cinema.fullimage = process.env.VUE_APP_ASSETS_URL + cinema.image;
          });
        })
        .catch((error) => {
          console.log(error);
          this.$swal.fire({
            title: "Error",
            text: "Error getting cinemas list",
            icon: "error",
          });
        });
    },
    selectFile(file) {
      this.currentFile = file;
    },
    editItem(item) {
      this.editedIndex = this.cinemas.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
      this.currentFile = undefined;
    },
    deleteItem(item) {
      this.editedIndex = this.cinemas.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },
    deleteItemConfirm() {
      // if there's an image, delete it
      if (this.editedItem.image) {
        deleteImage(this.editedItem, false);
      }

      delEntity("Cinema", this.editedItem)
      .then(() => {
        this.initialize();
        this.$swal.fire({
          title: "Success",
          text: "Cinema deleted",
          icon: "success",
        });
      })
      .catch((error) => {
        console.log(error);
        this.$swal.fire({
          title: "Error",
          text: "Error deleting cinema",
          icon: "error",
        });
      });
      
      this.closeDelete();
    },
    auditoriums(item) {
      this.$router.push(`/auditorium/${item.id}`);
    },
    close() {
      this.dialog = false;
      if (this.currentFile) {
        this.currentFile = undefined;
        this.$refs.fileupload.reset();
      }
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },
    closeDelete() {
      this.dialogDelete = false;
      if (this.currentFile) {
        this.currentFile = undefined;
        this.$refs.fileupload.reset();
      }
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },
    deleteLocalImage(item) {
      deleteImage(item, true)
      .then(() => {
          this.initialize();

          this.$swal.fire({
            title: "Success",
            text: "Image deleted",
            icon: "success",
          });

          this.close();
      });
    },
    save() {
      saveEntity(this.editedItem, this.currentFile)
      .then(() => {
        this.initialize();

        this.$swal.fire({
          title: "Success",
          text: "Cinema saved sucessfully",
          icon: "success",
        });

        this.close();
      })
      .catch((err) => {
          console.log(err);

          this.$swal.fire({
            title: "Error",
            text: "Error saving Cinema",
            icon: "error",
          });

      });
    },
  },
};
</script>
