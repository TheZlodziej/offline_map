import { type MQTTTopic, MQTTClient, type MQTTClientInfo, type RocketLivePacketKey } from "./mqttclient";
import { getMqttTopics } from "./topics";
// ------------------------------------------------------------------------
// External Services:
export const google_maps_api_key =
	"AIzaSyB7hB3GwLo_9dZg-GG6Ombh-McbMhiFOOs";

// ------------------------------------------------------------------------
// External Apps Config:

interface ConfigApp {
	url: string;
	tooltip: string;
	icon: string;
}

export const config_apps: Array<ConfigApp> = [
	{
		url: "http:\\\\192.168.10.20",
		tooltip: "LP Box",
		icon: "fa-solid fa-eye",
	},
	{
		url: "http:\\\\192.168.10.30",
		tooltip: "Companion",
		icon: "fa-solid fa-eye",
	},
	{
		url: "http:\\\\192.168.10.31",
		tooltip: "HECU",
		icon: "fa-solid fa-eye",
	},
];

// ------------------------------------------------------------------------
// In flight view config:

export const last_packet_keys = new Array<RocketLivePacketKey>(
	"counter",
	"time_utc",
	"latitude",
	"longitude",
	"acceleration_x",
	"acceleration_y",
	"acceleration_z",
	"gyr_x",
	"gyr_y",
	"gyr_z",
	"pressure",
	"altitude",
	"roll",
	"pitch",
	"heading",
	"q0",
	"q1",
	"q2",
	"q3",
	"n2o_pressure",
	"pitot_pressure",
	"satelites_number",
	"temperature",
	"mach_number",
	"true_air_speed",
	"max_acceleration_x",
	"max_acceleration_y",
	"max_acceleration_z",
	"max_altitude",
	// tracker
	"longitude_direction",
	"latitude_direction",
	"hdop",
	"course",
)

// ------------------------------------------------------------------------
// MQTT Config:

type env = "dev" | "prod";

const env: env = "prod";

const pccHost = env === ("prod" as env) ? "192.168.10.10" : "localhost";
const companionHost = env === ("prod" as env) ? "192.168.10.30" : "localhost";
const lpbHost = env === ("prod" as env) ? "192.168.10.20" : "localhost";

const pcc_info: MQTTClientInfo = {
	host: pccHost, // "192.168.10.10",
	port: 9001,
	connect_timeout: 4000,
	reconnect_period: 4000,
	connection_method: "mqtt",
	// Certification Information
	client_id: "pcc-fronted-mqtt-pcc",
	username: "user",
	password: "password",
};

const companion_info: MQTTClientInfo = {
	host: companionHost, // "192.168.10.30",
	port: 9001,
	connect_timeout: 4000,
	reconnect_period: 4000,
	connection_method: "mqtt",
	// Certification Information
	client_id: "pcc-fronted-mqtt-comapnion",
	username: "user",
	password: "password",
};

const lpb_info: MQTTClientInfo = {
	host: lpbHost, // "192.168.10.20",
	port: 9001,
	connect_timeout: 4000,
	reconnect_period: 4000,
	connection_method: "mqtt",
	// Certification Information
	client_id: "pcc-fronted-mqtt-lpb",
	username: "user",
	password: "password",
};

const pcc_client = new MQTTClient(pcc_info);
const companion_client = new MQTTClient(companion_info);
const lpb_client = new MQTTClient(lpb_info);

export const mqtt_topics: Array<MQTTTopic> = getMqttTopics(
	pcc_client,
	companion_client,
	lpb_client
);