L.Arc = L.Polyline.extend({
    options: {
        weight: 5,
        color: '#ffff00',
        stroke: true
    },

    initialize ({
        center = [0, 0],
        radius = 100,
        startBearing = 0,
        endBearing = 90,
        numberOfPoints = 32,
        rhumb = false,
        ...options
    }) {
        this.setOptions(options)
            .setCenter(center)
            .setRadius(radius)
            .setStartBearing(startBearing)
            .setEndBearing(endBearing)
            .setNumberOfPoints(numberOfPoints)
            .setRhumb(rhumb)

        this._setLatLngs(this.getLatLngs())
    },

    getCenter () { return this._center },

    setCenter (center) {
        this._center = L.latLng(center)
        return this.redraw()
    },

    getRadius () { return this._radius },

    setRadius (radius = 100) {
        this._radius = Math.abs(radius)
        return this.redraw()
    },

    getStartBearing () { return this._startBearing },

    setStartBearing (startBearing = 0) {
        this._startBearing = startBearing
        return this.redraw()
    },

    getEndBearing () { return this._endBearing },

    setEndBearing (endBearing = 90) {
        this._endBearing = endBearing
        return this.redraw()
    },

    getNumberOfPoints () { return this._numberOfPoints },

    setNumberOfPoints (numberOfPoints = 32) {
        this._numberOfPoints = Math.max(10, numberOfPoints)
        return this.redraw()
    },

    getOptions () { return this.options },

    setOptions (options = {}) {
        L.setOptions(this, options)
        return this.redraw()
    },

    getLatLngs () {
        const angle = this.getEndBearing() - this.getStartBearing()
        const ptCount = angle * this.getNumberOfPoints() / 360
        const latlngs = []
        const deltaAngle = angle/ptCount

        for (let i = 0; i < ptCount; i++) {
            const useAngle = this.getStartBearing() + deltaAngle * i
            latlngs.push(this.computeDestinationPoint(
                this.getCenter(),
                this.getRadius(),
                useAngle
            ))
        }
        latlngs.push(this.computeDestinationPoint(
            this.getCenter(),
            this.getRadius(),
            this.getEndBearing()
        ))
        return latlngs
    },

    setLatLngs (latLngs = this.getLatLngs()) {
        this._setLatLngs(latLngs)
        return this.redraw()
    },

    setStyle: L.Path.prototype.setStyle,

    getRhumb () { return this._rhumb },

    setRhumb (rhumb = 45) {
        this._rhumb = rhumb
        return this.redraw()
    },

    computeDestinationPoint (
        start = {lat: 0, lng: 0},
        distance = 1,
        bearing = 0,
        radius = 6378137,
        rhumb = this.getRhumb()
    ) {
        if (rhumb) {
            /*http://www.movable-type.co.uk/scripts/latlong.html*/

            const δ = Number(distance) / radius // angular distance in radians
            const φ1 = start.lat * Math.PI / 180
            const λ1 = start.lng * Math.PI / 180
            const θ = bearing * Math.PI / 180

            const Δφ = δ * Math.cos(θ)
            let φ2 = φ1 + Δφ

            // check for some daft bugger going past the pole, normalise latitude if so
            if (Math.abs(φ2) > Math.PI/2) φ2 = φ2>0 ? Math.PI-φ2 : -Math.PI-φ2

            const Δψ = Math.log(Math.tan(φ2/2+Math.PI/4)/Math.tan(φ1/2+Math.PI/4))
            const q = Math.abs(Δψ) > 10e-12 ? Δφ / Δψ : Math.cos(φ1) // E-W course becomes ill-conditioned with 0/0

            const Δλ = δ*Math.sin(θ)/q
            const λ2 = λ1 + Δλ

            //return new LatLon(φ2.toDegrees(), (λ2.toDegrees()+540) % 360 - 180); // normalise to −180..+180°
            return {
                lat: φ2 * 180 / Math.PI,
                lng: ((λ2 * 180 / Math.PI) + 540) % 360 - 180
            }
        }
        const bng = bearing * Math.PI / 180

        const lat1 = start.lat * Math.PI / 180
        const lon1 = start.lng * Math.PI / 180

        let lat2 = Math.asin( Math.sin(lat1)*Math.cos(distance/radius) +
            Math.cos(lat1)*Math.sin(distance/radius)*Math.cos(bng))

        let lon2 = lon1 + Math.atan2(Math.sin(bng)*Math.sin(distance/radius)*Math.cos(lat1),
            Math.cos(distance/radius)-Math.sin(lat1)*Math.sin(lat2))

        lat2 = lat2 * 180 / Math.PI
        lon2 = lon2 * 180 / Math.PI

        return {
            lat: lat2,
            lng: lon2
        }

    }
})

L.arc = ({
    center = [0, 0],
    radius = 100,
    startBearing = 0,
    endBearing = 90,
    numberOfPoints = 32,
    rhumb = false,
    ...options
}) =>
    new L.Arc({center, radius, rhumb, startBearing, numberOfPoints, endBearing, ...options})
