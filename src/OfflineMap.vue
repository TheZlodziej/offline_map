<script lang="ts">
import { defineComponent, onMounted, type PropType, onBeforeUnmount } from 'vue';
import "leaflet/dist/leaflet.css";
import L from "leaflet";

export default defineComponent({
    name: "OfflineMap",
    props: {
        markers: {
            type: Object as PropType<Array<L.Marker>>,
        },
        area: {
            type: String,
            required: true,
        },
        center: {
            type: Object as PropType<L.LatLng>,
            default: { lat: 32.941711, lng: -106.975440 },
        },
        zoom: {
            type: Number,
            default: 13,
        },
    },

    setup(props) {
        let map: L.Map;

        const tile_layer = L.tileLayer(`./areas/${props.area}/{z}/{x}/{y}.png`, {
            maxZoom: 16,
            minZoom: 12,
            attribution: '&copy; <a href="https://rocketlab.put.poznan.pl/">PUT Rocketlab</a>'
        });

        onMounted(() => {
            map = L.map("map");
            tile_layer.addTo(map);

            props.markers?.forEach((marker) => {
                marker.addTo(map);
            });

            map.setView([props.center.lat, props.center.lng], props.zoom);
        });

        onBeforeUnmount(() => {
            map.remove();
        });

        return {}
    }
});
</script>

<template>
    <div id="map"></div>
</template>

<style>
#map
{
    height: 100%;
}
</style>
