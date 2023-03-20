import { getJson } from "../../auth";
import { handleError } from "../components/errors";
import { LinkState } from "../../state";

export class Context {
  constructor() {
    this.state = undefined;
    this.printer = undefined;
    this.job = undefined;
    this.transfer = undefined;
    this.version = undefined;
    this.storage = [];
    this.currentStorage = undefined;
    this.telemetry = {
        temperature: {
        nozzle: {
            current: 0.0,
            target: 0.0,
        },
        bed: {
            current: 0.0,
            target: 0.0,
        },
        },
    };
    this.flow = 0;
    this.speed = 0;
    this.fan = {
        hotend: 0,
        print: 0,
    };
    this.link = {
      connect: {
        ok: true,
        message: "OK",
      },
      printer: {
        ok: true,
        message: "OK",
      },
    };
    this.fileExtensions = process.env['FILE_EXTENSIONS'];
  }

  update({ status, printer }) {
    if (status?.ok && status.payload) {
      this.updateStatus(status.payload.data);
    }

    if (printer) {
      this.updatePrinter(printer);
    }
  }

  updateStatus(status) {
    this.updateTelemetry(status.printer);
    this.updateJob(status.job);
    this.updateStorage(status.storage);
    this.updateTransfer(status.transfer);
    this.updateCamera(status.camera);
  }

  updatePrinter(printer) {
    this.printer = {
      "name": printer.name,
      "location": printer.location,
      "farmMode": printer.farm_mode,
      "nozzleDiameter": printer.nozzle_diameter,
      "minExtrusionTemp": printer.min_extrusion_temp,
      "serial": printer.serial,
      "hostname": printer.hostname,
      "port": printer.port,
    }
  }

  updateTelemetry(printer) {
    this.state = LinkState.fromApi(printer.state.toUpperCase());
    this.telemetry = {
      temperature: {
        nozzle: {
          current: printer.temp_nozzle,
          target: printer.target_nozzle,
        },
        bed: {
          current: printer.temp_bed,
          target: printer.target_bed,
        },
      },
      axis: {
        x: printer.axis_x,
        y: printer.axis_y,
        z: printer.axis_z,
      },
      flow: printer.flow,
      speed: printer.speed,
      fan: {
        hotend: printer.fan_hotend,
        print: printer.fan_print,
      },
    };
  }

  updateJob(job) {
    const oldJobId = this.job?.id || null;
    const newJobId = job?.id || null;

    if (oldJobId !== newJobId) {
      if (!newJobId) {
        this.job = undefined;
        return;
      }
      getJson("/api/v1/job")
        .then((response) => {
          const data = response.data;
          if (data.id !== this.job.id) {
             return;
          }
          this.job = {
            ...this.job,
            file: {
              name: data.name,
              displayName: data.display_name,
              path: data.path,
              displayPath: data.display_path,
              size: data.size,
              refs: {
                download: data.refs?.download,
                icon: data.refs?.icon,
                thumbnail: data.refs?.thumbnail,
              },
              meta: {
                filamentType: data.meta?.filament_type,
                layerHeight: data.meta?.layer_height,
                estimatedPrintTime: data.meta?.estimated_print_time,
              },
            },
          };
        })
        .catch((err) => handleError(err));
    }
    if (newJobId) {
      this.job = {
        file: undefined,
        timePrinting: 0,
        ...this.job,
        id: newJobId,
        progress: job.progress,
        timeRemaining: job.time_remaining,
      };
    }
  }

  updateStorage(storage) {
    Object.keys(storage).forEach(entry => {
        const data = {
            path: entry.path,
            name: entry.name,
            readOnly: entry.readOnly,
            freeSpace: entry.freeSpace,
        };
        const index = this.storage.findIndex(location => location.path === data.path);
        if (index !== -1) {
            this.storage[index] = data;
        } else {
            this.storage.push(data);
        }
    })
  }

  updateTransfer(transfer) {
    const oldId = this.transfer?.id || null;
    const newId = transfer?.id || null;

    if (oldId !== newId) {
      if (!newId) {
        this.transfer = undefined;
        return;
      }
      getJson("/api/v1/transfer")
        .then((response) => {
          const data = response.data;
          if (data.id !== this.transfer.id) {
            return;
          }
          this.transfer = {
            ...this.transfer,
            file: {
              displayName: data.display_name,
              path: data.path,
              size: data.size,
              toPrint: data.to_print,
            },
          };
        })
        .catch((err) => handleError(err));
    }
    if (newId) {
      this.transfer = {
        file: undefined,
        ...this.transfer,
        timeTransferring: transfer.time_transferring,
        id: newId,
        progress: transfer.progress,
        dataTransferred: transfer.data_transferred,
      };
    }
  }

  updateCamera(camera) {
    this.camera = {
      id: camera?.id,
    }
  }
}
