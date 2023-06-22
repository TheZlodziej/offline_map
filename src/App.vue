<script lang="ts">
import { mqtt_topics } from './config';
import { default as OfflineMap } from './components/OfflineMap.vue';
import L from 'leaflet';
import type { MQTTMessage, TelemetryPacket, TrackerPacket } from './mqttclient';
import { defineComponent, ref } from 'vue';
export default defineComponent({
  name: 'App',
  components: {
    OfflineMap
  },
  setup() {
    const pcc_topic = mqtt_topics[0];
    const telemetry_topic = mqtt_topics[1];
    const tracker_AV_topic = mqtt_topics[2];
    const tracker_NC_topic = mqtt_topics[3];
    const tracker_COTS_topic = mqtt_topics[4];

    // PCC
    const pcc_marker = new L.Marker(
      { lat: 32.941711, lng: -106.975440 },
      {
        icon: L.icon({
          iconUrl: './icons/pcc.svg',
          iconSize: [30, 30],
          iconAnchor: [15, 30],
          popupAnchor: [0, -30],
        })
      }
    );

    pcc_topic.client.subscribeTopic(pcc_topic);
    pcc_topic.client.addTopicCallback(pcc_topic, makeCallback(pcc_marker));

    // TELEMERY
    const telemetry_marker = new L.Marker(
      { lat: 32.941711, lng: -106.975440 },
      {
        icon: L.icon({
          iconUrl: './icons/telemetry.svg',
          iconSize: [30, 30],
          iconAnchor: [15, 30],
          popupAnchor: [0, -30],
        })
      }
    )

    telemetry_topic.client.subscribeTopic(telemetry_topic);
    telemetry_topic.client.addTopicCallback(telemetry_topic, makeCallback(telemetry_marker));

    // TRACKER AV
    const tracker_av_marker = new L.Marker(
      { lat: 32.941711, lng: -106.975440 },
      {
        icon: L.icon({
          iconUrl: './icons/tracker_av.svg',
          iconSize: [30, 30],
          iconAnchor: [15, 30],
          popupAnchor: [0, -30],
        })
      }
    )

    tracker_AV_topic.client.subscribeTopic(tracker_AV_topic);
    tracker_AV_topic.client.addTopicCallback(tracker_AV_topic, makeCallback(tracker_av_marker));

    // TRACKER NC
    const tracker_nc_marker = new L.Marker(
      { lat: 32.941711, lng: -106.975440 },
      {
        icon: L.icon({
          iconUrl: './icons/tracker_nc.svg',
          iconSize: [30, 30],
          iconAnchor: [15, 30],
          popupAnchor: [0, -30],
        })
      }
    )

    tracker_NC_topic.client.subscribeTopic(tracker_NC_topic);
    tracker_NC_topic.client.addTopicCallback(tracker_NC_topic, makeCallback(tracker_nc_marker));

    // TRACKER COTS
    const tracker_cots_marker = new L.Marker(
      { lat: 32.941711, lng: -106.975440 },
      {
        icon: L.icon({
          iconUrl: './icons/tracker_cots.svg',
          iconSize: [30, 30],
          iconAnchor: [15, 30],
          popupAnchor: [0, -30],
        })
      }
    )

    tracker_COTS_topic.client.subscribeTopic(tracker_COTS_topic);
    tracker_COTS_topic.client.addTopicCallback(tracker_COTS_topic, makeCallback(tracker_cots_marker));

    // MARKERS

    const markers: L.Marker[] = [
      pcc_marker,
      telemetry_marker,
      tracker_av_marker,
      tracker_nc_marker,
      tracker_cots_marker,
    ];

    function makeCallback(marker: L.Marker) {
      return (message: any) => {
        const packet = JSON.parse(message) as MQTTMessage;
        const data = packet.data as (TrackerPacket | TelemetryPacket);

        // telemetry nie ogarnia na której półkuli jest więc trzeba minusik za niego dodać
        if (packet.data.q0 !== undefined) {
          marker.setLatLng({
            lat: data.latitude,
            lng: -data.longitude, // Telemetry
          });
        } else {
          marker.setLatLng({
            lat: data.latitude,
            lng: data.longitude, // Tracker
          });
        }
      }
    }

    return { markers };
  }
});
</script>

<template>
  <div class="container">
    <OfflineMap :markers="markers" area_path="./areas/spaceport" :zoom="13"
      :center="{ lat: 33.193481, lng: -107.221710 }">
    </OfflineMap>
  </div>
</template>

<style scoped>
*
{
  margin: 0;
  padding: 0;
}

.container
{
  width: 100dvw;
  height: 100dvh;
  overflow: hidden;
  position: absolute;
  left: 0;
  top: 0;
}
</style>