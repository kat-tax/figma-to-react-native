import {h} from 'preact';

interface TextCollabDotsProps {
  target: string,
}

export function TextCollabDots(props: TextCollabDotsProps) {
  const users = [{
    id: '1',
    color: 'green',
  }, {
    id: '2',
    color: 'blue',
  }];
  return null;
  return (
    <span style={{marginLeft: 4}}>
      {users.map(({id, color}) =>
        <span key={id} style={{color}}>
          •
        </span>
      )}
    </span>
  );
}
