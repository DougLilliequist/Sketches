const computeLength = (vector) => {

    let length = 0;

    vector.forEach(component => {

        length += (component * component);

    })

    return Math.sqrt(length);

}

const transformTimbreVectorTo1D = (data) => {

    const {segments} = data;
    let timbre1DData = [];

    segments.forEach((segment, i) => {

        timbre1DData[i] = computeLength(segment.timbre);

    })

    return timbre1DData;

}

const getLoudnessPerBeat = (data) => {

    const {segments} = data;

    let loudnessData = []
    for(let i = 0; i < segments.length; i++) {

        loudnessData[i] = segments[i].loudness_start;

    }

    return loudnessData;

}

onmessage = (event) => {

    const timbre1DData = transformTimbreVectorTo1D(event.data)
    const loudnessData = getLoudnessPerBeat(event.data);

    postMessage({timbre1DData, loudnessData});

}