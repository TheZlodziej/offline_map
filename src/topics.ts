import { MQTTClient, type MQTTTopic } from "./mqttclient";

export const getMqttTopics = (
    pcc_client: MQTTClient,
    companion_client: MQTTClient,
    lpb_client: MQTTClient
): Array<MQTTTopic> => {
    return [
        {
            topic: "pcc/sensors/gps",
            name: "PCC: GPS",
            client: pcc_client,
            mission_profile: {
                rocket_live: {
                    packet_type: "gps",
                },
            },
        },
        {
            topic: "receiver-1/telemetry-packet",
            name: "Telemetry",
            status: {
                icon: "fa-solid fa-satellite-dish",
                tooltip: "Receiver telemetry",
            },
            client: pcc_client,
            mission_profile: {
                rocket_live: {
                    packet_type: "telemetry",
                },
            },
        },
        {
            topic: "receiver-2/tracker-packet",
            name: "Tracker AV",
            status: {
                icon: "fa-solid fa-satellite-dish",
                tooltip: "Receiver tracker AV",
            },
            client: pcc_client,
            mission_profile: {
                rocket_live: {
                    packet_type: "tracker",
                },
            },
        },
        {
            topic: "receiver-3/tracker-packet",
            name: "Tracker NC",
            status: {
                icon: "fa-solid fa-satellite-dish",
                tooltip: "Receiver tracker NC",
            },
            client: pcc_client,
            mission_profile: {
                rocket_live: {
                    packet_type: "tracker",
                },
            },
        },
        {
            topic: "receiver-4/tracker-packet",
            name: "Tracker COTS",
            status: {
                icon: "fa-solid fa-satellite-dish",
                tooltip: "Receiver tracker COTS",
            },
            client: pcc_client,
            mission_profile: {
                rocket_live: {
                    packet_type: "tracker",
                },
            },
        },
    ];
};
