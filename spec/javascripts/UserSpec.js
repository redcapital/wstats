describe("User", function() {
  var client = new Client('test-key'),
    user = new User(client),
    async = new AsyncSpec(this);

  describe("unrecognizedKanji", function() {
    beforeEach(function() {
      spyOn(client, 'api').andCallFake(function(resource, callback) {
        callback(Factory.build('response', { 
          requested_information: [
            Factory.build('kanji', { character: '工' }),
            Factory.build('kanji', { character: '川' })
          ]
        }));
      });
    });

    async.it("returns list of unrecognized kanji in a text", function(done) {
      user.unrecognizedKanji('私は田中です。川口です。', function(unrecognized) {
        expect(unrecognized.kanjiCount).toEqual(5);
        expect(unrecognized.list.sort()).toEqual(['私', '田', '中', '口'].sort());
        done();
      });
    });

    async.it("returns empty list if everything is recognized", function(done) {
      user.unrecognizedKanji('川 character. 工 character.', function(unrecognized) {
        expect(unrecognized.kanjiCount).toEqual(2);
        expect(unrecognized.list).toEqual([]);
        done();
      });
    });

    async.it("ignores non-kanji characters", function(done) {
      user.unrecognizedKanji('hello world', function(unrecognized) {
        expect(unrecognized.kanjiCount).toEqual(0);
        expect(unrecognized.list).toEqual([]);
        done();
      });
    });

    async.it("counts distinct kanjis", function(done) {
      user.unrecognizedKanji('this is 川 character - 川. 見返り柳.見返り柳.', function(unrecognized) {
        expect(unrecognized.kanjiCount).toEqual(4);
        expect(unrecognized.list).toEqual(['見', '返', '柳']);
        done();
      });
    });
  });
});
