import { SPACE, IDENT } from '../lib/tokenTypes'

export default tokenStream => {
  const values = [tokenStream.expect(IDENT)]

  while (tokenStream.hasTokens()) {
    tokenStream.expect(SPACE)
    values.push(tokenStream.expect(IDENT))
  }

  return {
    fontVariant: values,
  }
}
