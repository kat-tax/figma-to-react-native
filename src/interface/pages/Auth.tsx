import {h, Fragment} from 'preact';
import {useState, useCallback} from 'preact/hooks';
import {generateLinkToken} from 'common/random';
import {supabase} from 'vendor/supabase';
import * as F from '@create-figma-plugin/ui';

export function Auth() {
  const [hasSuccess, setHasSuccess] = useState(false);
  const [isLoggingIn, setLoggingIn] = useState(false);

  const login = useCallback(async () => {
    setLoggingIn(true);

    const token = generateLinkToken();

    await supabase.auth.signInWithOAuth({
      provider: 'figma',
      options: {
        redirectTo: `http://localhost:3000/link/${token}`,
      }
    });

    // open(`http://localhost:3000/link/${token}`, '_blank');
    setHasSuccess(false);
    setTimeout(() => {
      setHasSuccess(false);
      setLoggingIn(false);
    }, 5000);
  }, []);

  return (
    <Fragment>
      {hasSuccess &&
        <F.Banner icon={<F.IconComponent32/>} variant="success">
          {`Successfully linked plugin to your account!`}
        </F.Banner>
      }
      {false &&
        <F.Banner icon={<F.IconWarning32/>} variant="warning">
          {`The credentials entered are invalid. `}
          <a href="https://figma-to-react-native.com/dashboard" target="_blank" style={{color: '#000'}}>
            {`Click here to create an account`}
          </a>
        </F.Banner>
      }
      <F.Container space="medium" style={{maxWidth: 330}}>
        <F.VerticalSpace space="large"/>
        <Fragment>
          <F.VerticalSpace space="large"/>
          <F.Button
            fullWidth
            title="Click to login"
            loading={isLoggingIn}
            disabled={isLoggingIn}
            onClick={login}>
            {`Login`}
          </F.Button>
        </Fragment>
        <F.VerticalSpace space="large"/>
      </F.Container>
    </Fragment>
  );
}
