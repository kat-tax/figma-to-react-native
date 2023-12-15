export default (aspectRatio: any) => {
  if (aspectRatio.auto) {
    return 'auto';
  } else {
    if (aspectRatio.ratio[0] === aspectRatio.ratio[1]) {
      return 1;
    } else {
      return aspectRatio.ratio.join(' / ');
    }
  }
}
