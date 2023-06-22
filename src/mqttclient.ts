import mqtt from "mqtt";

export interface MQTTMessage {
  timestamp: string;
  counter: number;
  data: any;
}

export type RocketLiveFlightStatus =
  | "Launchpad"
  | "Mach Delay"
  | "Coast"
  | "Drogue Deployment"
  | "Drogue Descent"
  | "Main Deployment"
  | "Main Descent"
  | "Landed"
  | "Unknown";

export interface Flags {
  /*
    7 bits for flags
    */
  flag1: boolean;
  flag2: boolean;
  flag3: boolean;
  flag4: boolean;
  flight_state: RocketLiveFlightStatus; // 3 bit flag.
}

export interface PacketInfo {
  /*
    1-8bits - message reciver ID
    it has to be 0xff
    */
  msg_len: number;
  /*
    1-8bits - message transmiter ID
    you can use it as you want
    */
  id_tx: number;
  /*
    1bit    - String or struct message (1 or 0)
    2-8bits - For user flags
    you can use it as you like
    */
  flags: Flags;
}

export interface GpsBase {
  time_utc: string;
  latitude: number;
  longitude: number;
  satelites_number: number;
}

export interface Barometer {
  pressure: number;
  altitude: number;
  max_altitude: number;
  temperature: number;
}

export interface PacketBase {
  info: PacketInfo;
  counter: number;
  time_between_packets: number;
}

export interface TelemetryPacket extends PacketBase, GpsBase, Barometer {
  acceleration_x: number;
  acceleration_y: number;
  acceleration_z: number;
  max_acceleration_x: number;
  max_acceleration_y: number;
  max_acceleration_z: number;
  true_air_speed: number;
  mach_number: number;
  roll: number;
  pitch: number;
  heading: number;
  q0: number;
  q1: number;
  q2: number;
  q3: number
  displacement_x: number;
  displacement_y: number;
  velocity_horizontal: number;
  velocity_vertical: number;
  n2o_pressure: number;
  pitot_pressure: number;
  gyr_x: number;
  gyr_y: number;
  gyr_z: number;
}

export interface TrackerPacket extends PacketBase, GpsBase, Barometer {
  latitude_direction: number;
  longitude_direction: number;
  hdop: number;
  course: number;
}

export type RocketLiveView = "chart" | "map" | "rocket-visualization";
export type RocketLivePacketKey = keyof TelemetryPacket | keyof TrackerPacket;
export type RocketLivePacket = TelemetryPacket & TrackerPacket;

export interface MissionProfileSwitchStateInfo {
  state_bit: number;
  dom_on_id: string;
  dom_off_id: string;
}

export interface MissionProfile {
  switches?: Array<MissionProfileSwitchStateInfo>;
  dom_text_id?: string;
  highlight?: (dom_element: HTMLElement, value: number | string) => void;
}

export type RocketLivePacketyType = "telemetry" | "tracker" | "gps";

export interface RocketLiveMissionProfile {
  packet_type: RocketLivePacketyType;
}

export interface MQTTTopic {
  topic: string;
  name: string;
  client: MQTTClient;
  unit?: string;
  icon?: string;

  chart?: {
    series_name?: string;
    series_color?: string;
  };
  settings?: {
    qos: 0 | 1 | 2;
  };
  mission_profile?: {
    fueling?: MissionProfile;
    engine_test?: MissionProfile;
    rocket_live?: RocketLiveMissionProfile;
  };
  status?: {
    tooltip: string;
    icon: string;
  };
}

export interface OrderedMQTTTopic extends MQTTTopic {
  id: number;
}

export interface MQTTClientInfo {
  host: string;
  port: number;
  connect_timeout: number;
  reconnect_period?: number;
  connection_method?: string;
  client_id?: string;
  username?: string;
  password?: string;
}

export class MQTTClient {
  client?: mqtt.MqttClient;
  topic_callbacks: Map<string, Function>;
  status_callbacks: Map<string, Function>;

  constructor(client_info: MQTTClientInfo) {
    this.setupClient(client_info);
    this.topic_callbacks = new Map();
    this.status_callbacks = new Map();
  }

  public disconnect() {
    console.log("[mqttclient.ts] Disconnecting from the server...");
    if (this.client?.connected) {
      try {
        this.client.end();
        console.log("[mqttclient.ts] Successfully disconnected!");
      } catch (error: any) {
        console.log("[mqttclient.ts] Disconnect failed", error);
      }
    }
  }

  public unsubscribeTopic(topic: MQTTTopic, ignore_status = false) {
    // unsubscribes topic only if status callbacks don't use the topic (can be overriden with ignore_status param)
    if (!this.status_callbacks.has(topic.topic) || ignore_status) {
      this.client?.unsubscribe(topic.topic, (error: any, res: any) => {
        if (error) {
          console.error("[mqttclient.ts] Unsubscribe topic error", error);
        } else {
          console.log(`[mqttclient.ts] Unsubscribed topic:${topic.topic}`);
        }
      });
    } else {
      console.warn(
        `[mqttclient.ts] Didn't unsubscribe topic:${topic.topic} because status_callback is using it and ignore_status flag was set to false but it's callback was removed (if there was any)`
      );
    }

    // if ignore_status is set to true remove it's callback as well
    if (ignore_status && this.status_callbacks.has(topic.topic)) {
      this.status_callbacks.delete(topic.topic);
    }

    // remove topic callback even if topic wasn't unsubscribed
    if (this.topic_callbacks.has(topic.topic)) {
      this.topic_callbacks.delete(topic.topic);
    }
  }

  public publishOnTopic(topic: MQTTTopic, message: string) {
    this.client?.publish(topic.topic, message);
  }

  public subscribeTopic(topic: MQTTTopic) {
    this.client?.subscribe(
      topic.topic,
      topic.settings as mqtt.IClientSubscribeOptions,
      (error: any, result: any) => {
        if (error) {
          console.error("[mqttclient.ts] Subscribe to topic error", error);
          return;
        }

        console.log("[mqttclient.ts] Subscribe to topic result", result);
      }
    );
  }

  public addStatusCallback(topic: MQTTTopic, callback: Function) {
    if (this.topic_callbacks.has(topic.topic)) {
      console.warn(
        `[mqttclient.ts] Topic:${topic.topic} already subscribed by another component`
      );
    }

    if (this.status_callbacks.has(topic.topic)) {
      console.warn(
        `[mqttclient.ts] Overwriting status callback for topic:${topic.topic}`
      );
    }

    this.status_callbacks.set(topic.topic, callback);
  }

  public addTopicCallback(topic: MQTTTopic, callback: Function) {
    if (this.status_callbacks.has(topic.topic)) {
      console.warn(
        `[mqttclient.ts] Topic:${topic.topic} already subscribed by another component`
      );
    }

    if (this.topic_callbacks.has(topic.topic)) {
      console.warn(
        `[mqttclient.ts] Overwriting topic callback for topic:${topic.topic}`
      );
    }

    this.topic_callbacks.set(topic.topic, callback);
  }

  private setupClient(client_info: MQTTClientInfo) {
    const { host, port, connection_method, ...options } = client_info;
    const connectUrl = `${connection_method}://${host}:${port}/`;

    try {
      this.client = mqtt.connect(connectUrl, options);
    } catch (error) {
      this.onError(error as Error);
    }

    this.client?.on("connect", this.onConnect);
    this.client?.on("error", (error: Error) => this.onError(error));
    this.client?.on("message", (topic: string, message: string) =>
      this.onMessage(topic, message)
    );
  }

  private onMessage(topic: string, message: string) {
    // console.log(`[mqttclient.ts] Received message ${message} from topic ${topic}`);
    if (this.topic_callbacks.has(topic)) {
      const topic_callback = this.topic_callbacks.get(topic);
      if (topic_callback !== undefined) {
        topic_callback(message);
      }
    }

    if (this.status_callbacks.has(topic)) {
      const status_callback = this.status_callbacks.get(topic);
      if (status_callback !== undefined) {
        status_callback(message);
      }
    }
  }

  private onError(error: Error) {
    console.error("[mqttclient.ts] Connection failed", error);
  }

  private onConnect() {
    console.log("[mqttclient.ts] Connection succeeded!");
  }
}
