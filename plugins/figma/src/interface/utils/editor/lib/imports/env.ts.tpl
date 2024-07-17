declare module "*.svg" {
  import type {SvgProps} from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}
