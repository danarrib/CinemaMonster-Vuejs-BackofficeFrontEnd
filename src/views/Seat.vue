<template>
  <div>
    <v-container>
        <template>
            <h2>Seats for {{ auditorium.name }} on {{ auditorium.cinema.name }}</h2>
        </template>
      <template>
        <table>
          <tr>
            <td :colspan="auditorium.seatColumns" align="center">
              <v-btn depressed color="blue" block>Screen</v-btn>
            </td>
          </tr>
          <tr v-for="row in seatsDrawing" :key="row.id">
            <td v-for="seat in row.seats" :key="seat.key">
              <v-btn 
                depressed 
                block 
                @click="editItem(seat)"

                ><v-icon :color="seat.seatType.color">{{ seat.seatType.icon }}</v-icon>
            {{ seat.name }}</v-btn>
            </td>
          </tr>
        </table>
      </template>

      <template>
        <v-dialog v-model="dialog" max-width="500px">
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
                        label="Seat name"
                        readonly
                      />
                    </v-col>
                    <v-col cols="12" sm="12" md="6">
                      <v-select
                        :items="seattypes"
                        item-text="name"
                        item-value="id"
                        label="Type"
                        :rules="typeRules"
                        v-model="editedItem.seatType.id"
                      ></v-select>
                    </v-col>
                    <v-col cols="12" sm="12" md="6">
                      <v-text-field
                        v-model.number="editedItem.row"
                        label="Row"
                        type="number"
                        readonly
                      />
                    </v-col>
                    <v-col cols="12" sm="12" md="6">
                      <v-text-field
                        v-model.number="editedItem.column"
                        label="Column"
                        type="number"
                        readonly
                      />
                    </v-col>
                    <v-col cols="12" sm="12" md="6">
                      <v-switch v-model="editedItem.enabled" label="Enabled" />
                    </v-col>
                  </v-row>
                </v-container>
              </v-form>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
              <v-btn color="blue darken-1" text @click="save" :disabled="!valid"
                >Save</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog>
      </template>
    </v-container>
  </div>
</template>

<script>
import { getAll, addEntity, updEntity, delEntity } from "@/apicalls";

async function saveEntity(item) {
  // Save entity (insert or update)
  if (item.id > 0) {
    let ret = await updEntity("Seat", item);
    console.log(ret);
    console.log("Entity updated");
  } else {
    let ret = await addEntity("Seat", item);
    console.log(ret);
    console.log("Entity added");
  }
}

async function getPageData(page) {
  let t1 = getAll("Auditorium/" + page.auditorium.id);
  let t2 = getAll("Seat/byAuditorium/" + page.auditorium.id);
  let t3 = getAll("SeatType");

  let result = await Promise.all([t1, t2, t3]);
  page.auditorium = result[0].data;
  page.seats = result[1].data;
  page.seattypes = result[2].data;
}

export default {
  data() {
    return {
      nameRules: [
        (v) => !!v || "Seat name is required",
        (v) =>
          v.length >= 2 ||
          "Seat name length must be more than 4 characters",
      ],
      typeRules: [
        (v) => !!v || "Seat type is required",
      ],
      valid: false,
      auditorium: {
        name: "",
        id: 0,
        cinema: {
          name: "",
          id: 0,
        },
      },
      seats: [],
      seattypes: [],
      seatsDrawing: [], // Seat Rows
      dialog: false,
      dialogDelete: false,
      editedIndex: -1,
      editedItem: {
        id: 0,
        name: "",
        row: 0,
        column: 0,
        seatType: {
          name: "",
          id: "",
          icon: "",
          color: "",
          handcap: false,
          obese: false,
          wheelChair: false,
        },
        enabled: true,
        auditorium: {
          id: 0,
          name: "",
          cinema: {
            id: 0,
            name: "",
          },
        },
      },
      defaultItem: {
        id: 0,
        name: "",
        row: 0,
        column: 0,
        seatType: {
          name: "",
          id: "",
          icon: "",
          color: "",
          handcap: false,
          obese: false,
          wheelChair: false,
        },
        enabled: true,
        auditorium: {
          id: 0,
          name: "",
          cinema: {
            id: 0,
            name: "",
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
      this.auditorium.id = this.$route.params.auditoriumId;

      getPageData(this)
        .then(() => {
          this.drawSeats();
          this.linkSeatsWithData();
        })
        .catch(() => {
          this.$swal.fire({
            title: "Error",
            text: "Error getting page data",
            icon: "error",
          });
        });
    },
    getRowName(rowNumber) {
      if (rowNumber < 1 || rowNumber > 26) {
        return "Error";
      }

      let arrNames = [
        "Err",
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "W",
        "V",
        "X",
        "Y",
        "Z",
      ];
      return arrNames[rowNumber];
    },
    drawSeats() {
      this.seatsDrawing = [];
      for (let iRow = 1; iRow <= this.auditorium.seatRows; iRow++) {
        let currentRowSeats = [];
        for (
          let iColumn = 1;
          iColumn <= this.auditorium.seatColumns;
          iColumn++
        ) {
          let currentSeat = {
            id: 0,
            row: iRow,
            column: iColumn,
            enabled: true,
            name: this.getRowName(iRow) + "-" + iColumn,
            key: iRow + "-" + iColumn,
            seatType: {
              name: "Standard",
              id: 1,
            },
          };
          currentRowSeats.push(currentSeat);
        }

        let currentRow = {
          rowNumber: iRow,
          seats: currentRowSeats,
        };

        this.seatsDrawing.push(currentRow);
      }
    },
    linkSeatsWithData() {
      this.seatsDrawing.forEach((seatRow) => {
        seatRow.seats.forEach((currentSeat) => {
          // Find data about this seat
          this.seats.some((seatData) => {
            if (
              seatData.row === currentSeat.row &&
              seatData.column === currentSeat.column
            ) {
              // Same seat - Copy information from data to drawer
              Object.assign(currentSeat, seatData);
              return true; // some() function works like forEach, but it breaks if we return true, so we can avoid unnecessary work
            } else {
              return false; // some() function works like forEach, but it breaks if we return true. As we didn't find the data yet, we'll keep running
            }
          });
        });
      });
    },
    editItem(item) {
      this.editedIndex = item.id;
      this.editedItem = Object.assign({}, item);
      this.editedItem.auditorium.id = this.auditorium.id;
      this.dialog = true;
    },
    deleteItem(item) {
      this.editedIndex = this.seats.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },
    deleteItemConfirm() {
      delEntity("Seat", this.editedItem)
        .then(() => {
          this.initialize();
          this.$swal.fire({
            title: "Success",
            text: "Seat deleted",
            icon: "success",
          });
        })
        .catch((error) => {
          console.log(error);
          this.$swal.fire({
            title: "Error",
            text: "Error deleting seat",
            icon: "error",
          });
        });

      this.closeDelete();
    },
    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = 0;
      });
    },
    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = 0;
      });
    },
    save() {
      this.editedItem.auditorium.id = this.auditorium.id;
      saveEntity(this.editedItem)
        .then(() => {
          this.initialize();

          this.$swal.fire({
            title: "Success",
            text: "Seat saved sucessfully",
            icon: "success",
          });

          this.close();
        })
        .catch((err) => {
          console.log(err);

          this.$swal.fire({
            title: "Error",
            text: "Error saving Seat",
            icon: "error",
          });
        });
    },
  },
};
</script>
