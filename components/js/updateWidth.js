const updateWidth = function updateWidth() {
  const { width, components } = this.props();
  const { mapTimeline, mapReadout } = components;
  mapTimeline
    .width(width)
    .updateSize();
  mapReadout.position({ bottom: mapTimeline.height() })
    .update();
};

export default updateWidth;
