<template>
  <div>
    <v-container>
      <template>
        <v-data-table
          :headers="headers"
          :items="auditoriums"
          sort-by="name"
          class="elevation-1"
          disable-pagination
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>Auditoriums for {{ cinema.name }}</v-toolbar-title>
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
                    >New Item</v-btn>
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
                              label="Auditorium name"
                              :rules="nameRules"
                            />
                          </v-col>
                          <v-col cols="12" sm="12" md="6">
                            <v-select
                              :items="auditoriumtypes"
                              item-text="name"
                              item-value="id"
                              label="Type"
                              :rules="typeRules"
                              v-model="editedItem.auditoriumType.id"
                            ></v-select>
                          </v-col>
                          <v-col cols="12" sm="12" md="6">
                            <v-text-field
                              v-model.number="editedItem.seatRows"
                              label="Seat Rows"
                              type="number"
                              :disabled="editedItem.id !== 0"
                              :rules="seatRowsColumnsRules"
                            />
                          </v-col>
                          <v-col cols="12" sm="12" md="6">
                            <v-text-field
                              v-model.number="editedItem.seatColumns"
                              label="Seat Columns"
                              type="number"
                              :disabled="editedItem.id !== 0"
                              :rules="seatRowsColumnsRules"
                            />
                          </v-col>
                          <v-col cols="12" sm="12" md="6">
                            <v-text-field
                              v-model.number="editedItem.baseTicketPrice"
                              label="Base Ticket Price"
                              type="number"
                              :rules="baseTicketPriceRules"
                            />
                          </v-col>
                          <v-col cols="12" sm="12" md="6">
                            <v-switch
                              v-model="editedItem.enabled"
                              label="Enabled"
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

          <template v-slot:[`item.actions`]="{ item }">
            <v-icon class="mr-2" @click="seats(item)">mdi-seat</v-icon>
            <v-icon class="mr-2" @click="editItem(item)">mdi-pencil</v-icon>
            <v-icon @click="deleteItem(item)">mdi-delete</v-icon>
          </template>

          <template v-slot:[`item.enabled`]="{ item }">
            <v-simple-checkbox v-model="item.enabled" disabled />
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
} from "@/apicalls";

async function saveEntity(item) {
  // Save entity (insert or update)
  if (item.id > 0) {
    let ret = await updEntity("Auditorium", item);
    console.log(ret);
    console.log('Entity updated');
  }
  else {
    let ret = await addEntity("Auditorium", item);
    console.log(ret);
    console.log('Entity added');
  }
}

export default {
  data() {
    return {
      nameRules: [
        (v) => !!v || "Auditorium name is required",
        (v) => v.length > 4 || "Auditorium name length must be more than 4 characters",
      ],
      seatRowsColumnsRules: [
        (v) => !!v || "Auditorium Seat Rows and Columns are required",
//        (v) => Number.isInteger(v) !== true || "Auditorium Seat Rows and Columns must be integer numbers",
        (v) => v > 0 || "Auditorium Seat Rows and Columns greater than 0",
      ],
      baseTicketPriceRules: [
        (v) => !!v || "Auditorium base ticket price is required",
//        (v) => Number.isNumeric(v) !== true || "Auditorium base ticket price must be numeric",
        (v) => v > 0 || "Auditorium Seat Rows and Columns greater than 0",
      ],
      typeRules: [
        (v) => !!v || "Auditorium type is required",
      ],
      valid: false,
      headers: [
        {
          text: "Auditorium Name",
          align: "start",
          sortable: true,
          value: "name",
        },
        { text: "Type", value: "auditoriumType.name", sortable: true },
        { text: "Seat Rows", value: "seatRows", sortable: true },
        { text: "Seat Columns", value: "seatColumns", sortable: true },
        { text: "Enabled", value: "enabled", sortable: true },
        { text: "Actions", value: "actions", sortable: false },
      ],
      auditoriumtypes: [],
      auditoriums: [],
      dialog: false,
      dialogDelete: false,
      editedIndex: -1,
      cinema: {
          id: 1,
          name: 'Test cinema',
      },
      editedItem: {
        id: 0,
        name: '',
        seatRows: 0,
        seatColumns: 0,
        baseTicketPrice: 0,
        enabled: true,
        auditoriumType: {
          id: 0,
          name: "",
        },
        cinema: {
          id: 0,
          name: "",
        },
      },
      defaultItem: {
        id: 0,
        name: '',
        seatRows: 0,
        seatColumns: 0,
        baseTicketPrice: 0,
        enabled: true,
        auditoriumType: {
          id: 0,
          name: "",
        },
        cinema: {
          id: 0,
          name: "",
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
      this.cinema.id = this.$route.params.cinemaId;
      getAll("Cinema/" + this.cinema.id)
        .then((res) => {
          this.cinema = res.data;
        })
        .catch((error) => {
          console.log(error);
          this.$swal.fire({
            title: "Error",
            text: "Error getting cinema information",
            icon: "error",
          });
        });
      getAll("Auditorium/byCinema/" + this.cinema.id)
        .then((res) => {
          this.auditoriums = res.data;
        })
        .catch((error) => {
          console.log(error);
          this.$swal.fire({
            title: "Error",
            text: "Error getting auditoriums list",
            icon: "error",
          });
        });
      getAll("AuditoriumType")
        .then((res) => {
          this.auditoriumtypes = res.data;
        })
        .catch((error) => {
          console.log(error);
          this.$swal.fire({
            title: "Error",
            text: "Error getting auditorium types list",
            icon: "error",
          });
        });
    },
    editItem(item) {
      this.editedIndex = this.auditoriums.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.editedItem.cinema.id = this.cinema.id;
      this.dialog = true;
    },
    deleteItem(item) {
      this.editedIndex = this.auditoriums.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },
    seats(item) {
        this.$router.push(`/seat/${item.id}`);
    },
    deleteItemConfirm() {
      delEntity("Auditorium", this.editedItem)
      .then(() => {
        this.initialize();
        this.$swal.fire({
          title: "Success",
          text: "Auditorium deleted",
          icon: "success",
        });
      })
      .catch((error) => {
        console.log(error);
        this.$swal.fire({
          title: "Error",
          text: "Error deleting auditorium",
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
      this.editedItem.cinema.id = this.cinema.id;
      saveEntity(this.editedItem)
      .then(() => {
        this.initialize();

        this.$swal.fire({
          title: "Success",
          text: "Auditorium saved sucessfully",
          icon: "success",
        });

        this.close();
      })
      .catch((err) => {
          console.log(err);

          this.$swal.fire({
            title: "Error",
            text: "Error saving Auditorium",
            icon: "error",
          });

      });
    },
  },
};
</script>
