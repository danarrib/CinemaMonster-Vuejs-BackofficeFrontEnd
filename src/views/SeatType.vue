<template>
  <div>
    <v-container>
      <template>
        <v-data-table
          :headers="headers"
          :items="seattypes"
          sort-by="name"
          class="elevation-1"
          disable-pagination
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>Seat Types</v-toolbar-title>
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
                              label="Seat Type name"
                              :rules="nameRules"
                            />
                          </v-col>
                          <v-col cols="12" sm="12" md="6">
                            <v-text-field
                              v-model="editedItem.icon"
                              label="Icon (material design)"
                              :rules="iconRules"
                            />
                          </v-col>
                          <v-col cols="12" sm="12" md="8">
                            <v-text-field
                              v-model="editedItem.color"
                              label="Color"
                              readonly
                              :rules="colorRules"
                            />
                            <v-color-picker
                              hide-canvas
                              hide-inputs
                              hide-sliders
                              show-swatches
                              v-model="editedItem.color"
                              label="Color"
                              :swatches="swatches"
                            ></v-color-picker>                            
                          </v-col>
                          <v-col cols="12" sm="12" md="6">
                            <v-switch
                              v-model="editedItem.handcap"
                              label="Handcap"
                            />
                          </v-col>
                          <v-col cols="12" sm="12" md="6">
                            <v-switch
                              v-model="editedItem.obese"
                              label="Obese"
                            />
                          </v-col>
                          <v-col cols="12" sm="12" md="6">
                            <v-switch
                              v-model="editedItem.wheelChair"
                              label="WheelChair"
                            />
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

          <template v-slot:[`item.handcap`]="{ item }">
            <v-simple-checkbox v-model="item.handcap" disabled />
          </template>
          <template v-slot:[`item.obese`]="{ item }">
            <v-simple-checkbox v-model="item.obese" disabled />
          </template>
          <template v-slot:[`item.wheelChair`]="{ item }">
            <v-simple-checkbox v-model="item.wheelChair" disabled />
          </template>
          <template v-slot:[`item.icon`]="{ item }">
            <v-icon :color="item.color">{{ item.icon }}</v-icon>
          </template>

          <template v-slot:[`item.actions`]="{ item }">
            <v-icon class="mr-2" @click="editItem(item)">mdi-pencil</v-icon>
            <v-icon @click="deleteItem(item)">mdi-delete</v-icon>
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
import { getAll, addEntity, updEntity, delEntity } from "@/apicalls";

export default {
  data() {
    return {
      nameRules: [
        (v) => !!v || "Seat Type name is required",
        (v) =>
          v.length > 2 ||
          "Seat Type name length must be more than 2 characters",
      ],
      iconRules: [
        (v) => !!v || "Seat Type name is required",
        (v) =>
          v.length > 2 ||
          "Seat Type name length must be more than 2 characters",
      ],
      colorRules: [
        (v) => !!v || "Seat color is required",
        (v) =>
          v.length > 2 ||
          "Seat color length must be more than 2 characters",
      ],
      valid: false,
      headers: [
        {
          text: "Seat Type Name",
          align: "start",
          sortable: true,
          value: "name",
        },
        { text: "Handcap", value: "handcap", sortable: true },
        { text: "Obese", value: "obese", sortable: true },
        { text: "WheelChair", value: "wheelChair", sortable: true },
        { text: "Icon", value: "icon", sortable: false },
        { text: "Color", value: "color", sortable: false },
        { text: "Actions", value: "actions", sortable: false },
      ],
      swatches: [
        ['#000000', '#808080', '#800000', '#FF0000'],
        ['#800080', '#FF00FF', '#FFA500', '#FF7F50'],
        ['#008000', '#00FF00', '#808000', '#FFFF00'],
        ['#000080', '#0000FF', '#008080', '#00FFFF'],
      ],
      colors: [],
      seattypes: [],
      dialog: false,
      dialogDelete: false,
      editedIndex: -1,
      editedItem: {
        id: 0,
        name: "",
        icon: "",
        color: "",
        handcap: false,
        obese: false,
        wheelChair: false,
      },
      defaultItem: {
        id: 0,
        name: "",
        icon: "",
        color: "",
        handcap: false,
        obese: false,
        wheelChair: false,
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
      getAll("SeatType")
      .then((res) => {
        this.seattypes = res.data;
      })
      .catch((error) => {
        console.log(error);
        this.$swal.fire({
          title: "Error",
          text: "Error getting seat types list",
          icon: "error",
        });
      });

      this.buildColors();
    },
    buildColors() {
      let arrSingleAxis = ['00', 'C0', '80', 'FF'];
      arrSingleAxis.forEach((colorRed) => {
        let colorAxis = [];
        arrSingleAxis.forEach((colorGreen) => {
          arrSingleAxis.forEach((colorBlue) => {
            colorAxis.push('#' + colorRed + colorGreen + colorBlue);
          });
        });
        this.colors.push(colorAxis);
      });
      console.log(this.colors);
    },
    editItem(item) {
      this.editedIndex = this.seattypes.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item) {
      this.editedIndex = this.seattypes.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },

    deleteItemConfirm() {
      delEntity("SeatType", this.editedItem)
        .then(() => {
          this.initialize();
          this.$swal.fire({
            title: "Success",
            text: "Seat Type deleted",
            icon: "success",
          });
        })
        .catch((error) => {
          console.log(error);
          this.$swal.fire({
            title: "Error",
            text: "Error deleting seat type",
            icon: "error",
          });
        });
      this.closeDelete();
    },

    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    save() {
      if (this.editedIndex > -1) {
        // Update
        updEntity("SeatType", this.editedItem)
          .then(() => {
            this.initialize();
            this.$swal.fire({
              title: "Success",
              text: "Seat Type updated",
              icon: "success",
            });
          })
          .catch((error) => {
            console.log(error);
            this.$swal.fire({
              title: "Error",
              text: "Error updating seat type",
              icon: "error",
            });
          });
      } else {
        // Add
        addEntity("SeatType", this.editedItem)
          .then(() => {
            this.initialize();
            this.$swal.fire({
              title: "Success",
              text: "Seat Type added",
              icon: "success",
            });
          })
          .catch((error) => {
            console.log(error);
            this.$swal.fire({
              title: "Error",
              text: "Error adding seat type",
              icon: "error",
            });
          });
      }
      this.close();
    },
  },
};
</script>
