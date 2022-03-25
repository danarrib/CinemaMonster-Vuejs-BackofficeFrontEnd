<template>
  <div>
    <v-container>
      <template>
        <v-data-table
          :headers="headers"
          :items="movies"
          sort-by="name"
          class="elevation-1"
          disable-pagination
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>Movies</v-toolbar-title>
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
                          <v-col cols="12" sm="12" md="12">
                            <v-text-field
                              v-model="editedItem.name"
                              label="Movie name"
                              :rules="nameRules"
                            />
                          </v-col>
                          <v-col cols="12" sm="12" md="12">
                            <v-text-field
                              v-model="editedItem.originalName"
                              label="Movie original name"
                              :rules="nameRules"
                            />
                          </v-col>

                          <v-col cols="12" sm="12" md="6">
                            <v-text-field
                              v-model.number="editedItem.movieYear"
                              label="Movie Year"
                              :rules="movieYearRules"
                              type="number"
                            />
                          </v-col>

                          <v-col cols="12" sm="12" md="6">
                            <v-menu
                                ref="menu"
                                v-model="menu"
                                :close-on-content-click="false"
                                :return-value.sync="editedItem.premiereDate"
                                transition="scale-transition"
                                offset-y
                                min-width="auto"
                            >
                                <template v-slot:activator="{ on, attrs }">
                                <v-text-field
                                    v-model="editedItem.premiereDate"
                                    label="Movie premiere date"
                                    prepend-icon="mdi-calendar"
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                                ></v-text-field>
                                </template>
                                <v-date-picker
                                v-model="editedItem.premiereDate"
                                no-title
                                scrollable
                                >
                                <v-spacer></v-spacer>
                                <v-btn
                                    text
                                    color="primary"
                                    @click="menu = false"
                                >
                                    Cancel
                                </v-btn>
                                <v-btn
                                    text
                                    color="primary"
                                    @click="$refs.menu.save(editedItem.premiereDate)"
                                >
                                    OK
                                </v-btn>
                                </v-date-picker>
                            </v-menu>
                          </v-col>

                          <v-col cols="12" sm="12" md="6">
                            <v-text-field
                              v-model.number="editedItem.durationMinutes"
                              label="Movie Duration (minutes)"
                              :rules="movieDurationRules"
                              type="number"
                            />
                          </v-col>
                          <v-col cols="12" sm="12" md="6">
                            <v-select
                              :items="moviegenres"
                              item-text="name"
                              item-value="id"
                              label="Movie Genre"
                              :rules="genreRules"
                              v-model="editedItem.movieGenre.id"
                            ></v-select>
                          </v-col>
                          <v-col cols="12" sm="12" md="12">
                            <v-textarea
                              v-model="editedItem.synopsis"
                              label="Movie synopsis"
                              :rules="synopsisRules"
                            />
                          </v-col>
                          <v-col cols="12" sm="12" md="12">
                            <v-file-input
                              ref="fileupload"
                              show-size
                              truncate-length="30"
                              accept="image/*"
                              label="Movie Poster (300 x 445)"
                              @change="selectFile"
                              prepend-icon="mdi-camera"
                            />
                          </v-col>
                          <v-col cols="12" sm="12" md="12">
                            <v-text-field
                              v-model="editedItem.poster"
                              label="Poster"
                              disabled
                            />
                            <v-btn
                              @click="deleteLocalImage(editedItem)"
                              :disabled="!editedItem.poster"
                              >Delete poster</v-btn
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
            <v-icon class="mr-2" @click="editItem(item)">mdi-pencil</v-icon>
            <v-icon @click="deleteItem(item)">mdi-delete</v-icon>
          </template>

          <template v-slot:[`item.poster`]="{ item }">
            <v-img
              :src="item.fullposter"
              :alt="item.poster"
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
  let filename = item.poster.replace("assets/", "");
  let ret = await delEntity("Asset", { filename });
  item.poster = '';
  console.log(ret);
  console.log('File deleted: ' + filename);
  
  if(updateEntity) {
    let ret2 = await updEntity("Movie", item);
    console.log(ret2);
    console.log('Entity updated');
  }
}

async function saveEntity(item, currentFile) {
  // If it's editing, current record already has an poster and user are trying to add a new poster, then delete current poster
  if (item.id > 0 && currentFile && item.poster) {
    let filename = item.poster.replace("assets/", "");
    let ret = await delEntity("Asset", { filename });
    item.poster = '';
    console.log(ret);
    console.log('File deleted: ' + filename);
  }

  // If user is trying to add new poster, upload poster and update entity poster value
  if (currentFile) {
    let ret = await uploadAsset(currentFile);
    console.log(ret);
    console.log('File uploaded: ' + ret.data.filename);
    item.poster = 'assets/' + ret.data.filename;
  }

  // Save entity (insert or update)
  if (item.id > 0) {
    let ret = await updEntity("Movie", item);
    console.log(ret);
    console.log('Entity updated');
  }
  else {
    let ret = await addEntity("Movie", item);
    console.log(ret);
    console.log('Entity added');
  }
}

export default {
  data() {
    return {
      genreRules: [(v) => !!v || "Movie genre is required"],
      nameRules: [
        (v) => !!v || "Movie name is required",
        (v) => v.length > 4 || "Movie name length must be more than 4 characters",
      ],
      synopsisRules: [
        (v) => !!v || "Movie synopsis is required",
        (v) => v.length > 5 || "Movie synopsis length must be more than 5 characters",
      ],
      movieYearRules: [
        (v) => !!v || "Movie year is required",
        (v) => v > 1800 || "Movie year must be a valid year",
      ],
      movieDurationRules: [
        (v) => !!v || "Movie duration is required",
        (v) => v > 0 || "Movie duration must be greater than 0",
      ],
      premiereDateRules: [
        (v) => !!v || "Movie premiere date is required",
        (v) => v.length > 4 || "Movie premiere date length must be more than 4 characters",
      ],
      posterRules: [
        (v) => !v || v.size < 2000000 || "Image size should be less than 2 MB!",
      ],
      valid: false,
      headers: [
        { text: "Movie Name", align: "start", sortable: true, value: "name", },
        { text: "Movie Original Name", align: "start", sortable: true, value: "originalName", },
        { text: "Premiere Date", value: "premiereDate" },
        { text: "Year", value: "movieYear", sortable: true },
        { text: "Duration", value: "durationMinutes", sortable: true },
        { text: "Genre", value: "movieGenre.name", sortable: true },
        { text: "Poster", value: "poster", sortable: false },
        { text: "Actions", value: "actions", sortable: false },
      ],
      moviegenres: [],
      movies: [],
      dialog: false,
      menu: false,
      currentFile: undefined,
      dialogDelete: false,
      editedIndex: -1,
      editedItem: {
        name: "",
        originalName: "",
        poster: "",
        premiereDate: "",
        movieYear: 0,
        synopsis: "",
        durationMinutes: 0,
        movieGenre: {
            name: "",
            id: 0
        },
        id: 0
      },
      defaultItem: {
        name: "",
        originalName: "",
        poster: "",
        premiereDate: "",
        movieYear: 0,
        synopsis: "",
        durationMinutes: 0,
        movieGenre: {
            name: "",
            id: 0
        },
        id: 0
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
      getAll("MovieGenre")
        .then((res) => {
          this.moviegenres = res.data;
        })
        .catch((error) => {
          console.log(error);
          this.$swal.fire({
            title: "Error",
            text: "Error getting movie genres list",
            icon: "error",
          });
        });
      getAll("Movie")
        .then((res) => {
          this.movies = res.data;
          this.movies.forEach(function (movie) {
            movie.fullposter = process.env.VUE_APP_ASSETS_URL + movie.poster;
            movie.premiereDate = movie.premiereDate.substr(0, 10);
          });
        })
        .catch((error) => {
          console.log(error);
          this.$swal.fire({
            title: "Error",
            text: "Error getting movies list",
            icon: "error",
          });
        });
    },
    selectFile(file) {
      this.currentFile = file;
    },
    editItem(item) {
      this.editedIndex = this.movies.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
      this.currentFile = undefined;
    },
    deleteItem(item) {
      this.editedIndex = this.movies.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },
    deleteItemConfirm() {
      // if there's an poster, delete it
      if (this.editedItem.poster) {
        deleteImage(this.editedItem, false);
      }

      delEntity("Movie", this.editedItem)
      .then(() => {
        this.initialize();
        this.$swal.fire({
          title: "Success",
          text: "Movie deleted",
          icon: "success",
        });
      })
      .catch((error) => {
        console.log(error);
        this.$swal.fire({
          title: "Error",
          text: "Error deleting movie",
          icon: "error",
        });
      });
      
      this.closeDelete();
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
          text: "Movie saved sucessfully",
          icon: "success",
        });

        this.close();
      })
      .catch((err) => {
          console.log(err);

          this.$swal.fire({
            title: "Error",
            text: "Error saving Movie",
            icon: "error",
          });

      });
    },
  },
};
</script>
