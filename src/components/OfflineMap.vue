<script lang="ts">
import { defineComponent, onMounted, type PropType, onBeforeUnmount, type Ref, ref } from 'vue';
import "leaflet/dist/leaflet.css";
import L from "leaflet";

export default defineComponent({
    name: "OfflineMap",
    props: {
        markers: {
            type: Object as PropType<Array<L.Marker>>,
        },
        area_path: {
            type: String,
            required: true,
        },
        center: {
            type: Object as PropType<L.LatLng>,
            default: { lat: 0, lng: 0 },
        },
        zoom: {
            type: Number,
            default: 13,
        },
    },

    setup(props) {
        const map: Ref<L.Map> = ref(undefined);
        const tile_layer: Ref<L.TileLayer> = ref(undefined);

        onMounted(async () => {
            await fetch(`${props.area_path}/metadata.json`)
                .then((response) => response.json())
                .then((data) => {
                    const data_format = `${props.area_path}/${data.name}`;
                    const bounds = data.bounds.split(",").map(parseFloat);
                    const center = data.center.split(",").map(parseFloat);

                    tile_layer.value = L.tileLayer(data_format, {
                        maxZoom: data.maxzoom,
                        minZoom: data.minzoom,
                        center: L.latLng(center[0], center[1]),
                        maxBounds: L.latLngBounds(L.latLng(bounds[0], bounds[1]), L.latLng(bounds[2], bounds[3])), // < left top corner, right bottom corner >
                        maxBoundsViscosity: 1.0,
                        attribution: '&copy; <a href="https://rocketlab.put.poznan.pl/">PUT Rocketlab</a>'
                    });
                });

            map.value = L.map("map");
            tile_layer.value.addTo(map.value);

            props.markers?.forEach((marker) => {
                marker.addTo(map.value);
            });

            map.value.setView([props.center.lat, props.center.lng], props.zoom);
        });

        onBeforeUnmount(() => {
            map.value.remove();
        });

        function centerToPositionOfMarker(marker: L.Marker) {
            const marker_pos = marker.getLatLng();
            map.value.setView([marker_pos.lat, marker_pos.lng]);
        }

        return { centerToPositionOfMarker };
    }
});
</script>

<template>
    <div id="map">
        <div id="marker_buttons">
            <button v-for="marker of $props.markers">
                <img :src="marker.options.icon.options.iconUrl" v-on:click="() => centerToPositionOfMarker(marker)" />
            </button>
        </div>
    </div>
</template>

<style scoped>
#map
{
    height: 100%;
    position: relative;
}

#marker_buttons
{
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 999;
    padding: 10px 13px;
}

#marker_buttons>button
{
    padding: 7px 7px;
    margin-right: 6px;
    cursor: pointer;
}
</style>
