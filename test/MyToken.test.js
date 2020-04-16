require('dotenv').config({ path: '../.env' });
const Token = artifacts.require('MyToken');
const chai = require('chai');
const BN = web3.utils.BN;
const chaiBN = require('chai-bn')(BN);
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiBN);
chai.use(chaiAsPromised);

const expect = chai.expect;

beforeEach(async () => {
    this.myToken = await Token.new(process.env.INITIAL_TOKENS);
});
contract('Token Test', async accounts => {
    const [deployerAccount, recipientAccount, otherAccount] = accounts;
    it('Should all tokens be in my account', async () => {
        let instance = await this.myToken;
        let totalSupply = await instance.totalSupply();
        expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(totalSupply);
    });

    it('Should be possible to send tokens between accounts', async () => {
        const sendTokens = 10;
        let instance = await this.myToken;
        let totalSupply = await instance.totalSupply();
        expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(totalSupply);
        expect(instance.transfer(recipientAccount, sendTokens)).to.eventually.be.fulfilled;
        expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(
            totalSupply.sub(new BN(sendTokens))
        );
        expect(instance.balanceOf(recipientAccount)).to.eventually.be.a.bignumber.equal(new BN(sendTokens));
    });

    it('Should not be possible to send more token then availablity', async () => {
        let instance = await this.myToken;
        let totalSupply = await instance.totalSupply();
        let balanceOfDeployer = await instance.balanceOf(deployerAccount);
        expect(instance.transfer(recipientAccount, new BN(balanceOfDeployer + 1))).to.eventually.be.rejected;
        expect(instance.balanceOf(deployerAccount)).to.eventually.be.bignumber.equal(balanceOfDeployer);
    });
});
