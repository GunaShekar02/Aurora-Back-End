const getConfirmEmail = (name, email, verificationHash) => {
  const html = `
<html>
  <body>
    <table class="main-body" style="box-sizing: border-box; min-height: 150px; padding-top: 5px; padding-right: 5px; padding-bottom: 5px; padding-left: 5px; width: 100%; height: 100%; border-collapse: separate; background-color: rgb(216, 216, 216);" width="100%" height="100%" bgcolor="rgb(216, 216, 216)">
      <tbody style="box-sizing: border-box;">
        <tr class="row" style="box-sizing: border-box; vertical-align: top;" valign="top">
          <td class="main-body-cell" style="box-sizing: border-box; font-family: Helvetica, serif;">
            <table class="c7013" style="box-sizing: border-box; width: 100%; max-width: 550px; background-color: rgb(251, 132, 73); background-image: url('https://mailtrain.aurorafest.org/grapejs/uploads/0/top1.png'); margin-top: 0px; margin-right: auto; margin-bottom: 0px; margin-left: auto; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-collapse: collapse; background-position-x: left; background-position-y: top; background-attachment: scroll; background-repeat: no-repeat; background-size: contain;" width="100%" bgcolor="rgb(251, 132, 73)" background="https://mailtrain.aurorafest.org/grapejs/uploads/0/top1.png">
              <tbody style="box-sizing: border-box;">
                <tr style="box-sizing: border-box;">
                  <td id="i4q5q6" style="box-sizing: border-box; font-size: 12px; font-weight: 300; vertical-align: top; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px;" valign="top">
                    <table class="c7444" style="box-sizing: border-box; padding-top: 5px; padding-right: 5px; padding-bottom: 5px; padding-left: 5px; margin-top: 120px; margin-right: auto; margin-bottom: 10px; margin-left: auto; width: 80%;" width="80%">
                      <tbody style="box-sizing: border-box;">
                        <tr style="box-sizing: border-box;">
                          <td id="i1ecjf" style="box-sizing: border-box; font-size: 12px; font-weight: 300; vertical-align: top; color: rgb(111, 119, 125); margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px;" valign="top">
                            <img src="https://mailtrain.aurorafest.org/grapejs/uploads/0/logo192.png" alt="Aurora logo" class="c7732" style="box-sizing: border-box; color: black; width: 150px; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px;" width="150">
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <table class="c7895" style="box-sizing: border-box; padding-top: 5px; padding-right: 5px; padding-bottom: 5px; padding-left: 5px; color: rgb(255, 255, 255); margin-top: 0px; margin-right: auto; margin-bottom: 0px; margin-left: auto; width: 90%; text-align: left;" width="90%" align="left">
                      <tbody style="box-sizing: border-box;">
                        <tr style="box-sizing: border-box;">
                          <td id="ipfxdj" style="box-sizing: border-box; font-size: 12px; font-weight: 300; vertical-align: top; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px;" valign="top">
                            <div class="c8909" style="box-sizing: border-box; padding-top: 10px; padding-right: 10px; padding-bottom: 10px; padding-left: 10px; font-size: 32px; color: rgb(0, 0, 0); font-weight: 600; font-family: Helvetica, serif; margin-top: 0px; margin-right: 0px; margin-bottom: 25px; margin-left: 0px; text-align: left;">Confirm Your Email
                              <br style="box-sizing: border-box;">
                            </div>
                            <div class="c8385" style="box-sizing: border-box; padding-top: 10px; padding-right: 10px; padding-bottom: 10px; padding-left: 10px; font-size: 16px; font-weight: 400; color: rgb(0, 0, 0); margin-top: 0px; margin-right: 0px; margin-bottom: 25px; margin-left: 0px;">
                              <div style="box-sizing: border-box;">Hey ${name},
                              </div>
                              <div style="box-sizing: border-box;">
                                <br style="box-sizing: border-box;">
                              </div>
                              <div style="box-sizing: border-box;">We received a request for registration in Aurora 20 with email ${email} . To activate your account, verify your email by clicking the button below. Ignore this email if you have not registered.
                                <br data-highlightable="1" style="box-sizing: border-box;">
                              </div>
                            </div>
                            <a target="_blank" title="confirm email" href="https://aurorafest.org/verify/${verificationHash}" class="button" style="box-sizing: border-box; font-size: 22px; color: rgb(255, 255, 255); text-align: center; font-weight: 300; text-decoration-line: none; text-decoration-style: solid; text-decoration-color: currentcolor; text-decoration-thickness: auto; background-color: rgb(49, 67, 78); margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 10px; padding-top: 14px; padding-right: 25px; padding-bottom: 14px; padding-left: 25px; border-top-left-radius: 0px; border-top-right-radius: 0px; border-bottom-right-radius: 0px; border-bottom-left-radius: 0px;">Confirm Email</a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <table class="c11124" style="box-sizing: border-box; width: 100%; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-collapse: collapse; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; background-image: url('https://mailtrain.aurorafest.org/grapejs/uploads/0/bottoma-1.png'); background-position-x: left; background-position-y: top; background-attachment: scroll; background-repeat: no-repeat; background-size: cover;" width="100%" background="https://mailtrain.aurorafest.org/grapejs/uploads/0/bottoma-1.png">
                      <tbody style="box-sizing: border-box;">
                        <tr style="box-sizing: border-box;">
                          <td style="box-sizing: border-box;">
                            <table class="c2405" style="box-sizing: border-box; height: 275px; margin-top: 0px; margin-right: auto; margin-bottom: 10px; margin-left: auto; padding-top: 5px; padding-right: 5px; padding-bottom: 5px; padding-left: 5px; width: 100%;" width="100%" height="275">
                              <tbody style="box-sizing: border-box;">
                                <tr style="box-sizing: border-box;">
                                  <td id="ig6et" style="box-sizing: border-box; font-size: 12px; font-weight: 300; vertical-align: top; color: rgb(111, 119, 125); margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px;" valign="top">
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <div class="c11371" style="box-sizing: border-box; padding-top: 10px; padding-right: 10px; padding-bottom: 10px; padding-left: 10px; text-align: center; line-height: 20px; font-size: 13px; color: rgb(255, 255, 255); margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px;">
                              <div style="box-sizing: border-box;">ABV IIITM, Gwalior,
                              </div>
                              <div class="gjs-comp-selected" style="box-sizing: border-box;">Madhya Pradesh, 474015
                                <br style="box-sizing: border-box;">
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
`;
  const text = `
Hey ${name},

We received a request for registration in Aurora 20 with email ${email}. To activate your account, verify your email by clicking the link below. Ignore this email if you have not registered.

https://aurorafest.org/verify/${verificationHash}

ABV-IIITM, Gwalior, Madhya Pradesh, 474015
`;
  return {
    html,
    text,
  };
};

module.exports = getConfirmEmail;
